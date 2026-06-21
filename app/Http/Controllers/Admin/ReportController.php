<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Order;
use App\Models\StockLog;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function stockReport(Request $request)
    {
        // Get all products with their inventory or sizes
        $products = Product::with(['inventory', 'sizes', 'category'])
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                if ($product->sizes && $product->sizes->count() > 0) {
                    // Product with sizes - create a row for each size
                    return $product->sizes->map(function ($size) use ($product) {
                        return (object)[
                            'product_name' => $product->name,
                            'category_name' => $product->category?->name ?? 'Uncategorized',
                            'size_variant' => $size->size . ' (' . $size->size_type . ')',
                            'current_stock' => $size->stock,
                            'min_alert' => $size->minimum_stock ?? 5,
                            'status' => $this->getStockStatusLabel($size->stock, $size->minimum_stock ?? 5),
                            'status_color' => $this->getStockStatusColor($size->stock, $size->minimum_stock ?? 5),
                        ];
                    });
                } else {
                    // Simple product (no sizes)
                    $stock = $product->inventory?->stock ?? 0;
                    $minAlert = $product->inventory?->minimum_stock ?? 5;

                    return collect([(object)[
                        'product_name' => $product->name,
                        'category_name' => $product->category?->name ?? 'Uncategorized',
                        'size_variant' => '—',
                        'current_stock' => $stock,
                        'min_alert' => $minAlert,
                        'status' => $this->getStockStatusLabel($stock, $minAlert),
                        'status_color' => $this->getStockStatusColor($stock, $minAlert),
                    ]]);
                }
            })->flatten();

        // Calculate summary statistics
        $totalProducts = $products->count();
        $lowStockCount = $products->filter(fn($p) => $p->status === 'Low Stock')->count();
        $outOfStockCount = $products->filter(fn($p) => $p->status === 'Out of Stock')->count();
        $inStockCount = $products->filter(fn($p) => $p->status === 'In Stock')->count();

        // Calculate total inventory value
        $totalValue = Inventory::with('product')
            ->whereHas('product', fn($q) => $q->whereNotNull('id'))
            ->get()
            ->sum(fn($item) => $item->stock * ($item->product->base_price ?? 0));

        $data = [
            'products' => $products,
            'generated_at' => now(),
            'summary' => [
                'total_products' => $totalProducts,
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'in_stock' => $inStockCount,
                'total_value' => $totalValue,
            ]
        ];

        $pdf = Pdf::loadView('pdf.stock-report', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download('stock-report-' . now()->format('Y-m-d') . '.pdf');
    }

    private function getStockStatusLabel($stock, $minAlert)
    {
        if ($stock <= 0) return 'Out of Stock';
        if ($stock <= $minAlert) return 'Low Stock';
        return 'In Stock';
    }

    private function getStockStatusColor($stock, $minAlert)
    {
        if ($stock <= 0) return 'red';
        if ($stock <= $minAlert) return 'yellow';
        return 'green';
    }









    // In app/Http/Controllers/Admin/ReportController.php

public function stockLogsReport()
{
    $logs = StockLog::with(['product', 'user', 'order'])
        ->latest()
        ->paginate(100); // Get more logs for report

    $data = [
        'logs' => $logs,
        'generated_at' => now(),
        'summary' => [
            'total_entries' => $logs->total(),
            'stock_in' => $logs->where('type', 'in')->count(),
            'stock_out' => $logs->where('type', 'out')->count(),
            'orders' => $logs->where('type', 'order')->count(),
        ]
    ];

    $pdf = Pdf::loadView('pdf.stock-logs-report', $data);
    $pdf->setPaper('A4', 'landscape');

    return $pdf->download('stock-logs-' . now()->format('Y-m-d') . '.pdf');
}



/**
     * Generate a monthly sales report PDF (only months with completed orders)
     */
    public function salesReport()
{
    $monthlyData = [];
    $grandTotals = [
        'total_sales' => 0,
        'total_orders' => 0,
        'cod_count' => 0,
        'gcash_count' => 0,
        'paymaya_count' => 0,
        'bank_transfer_count' => 0,
    ];

    $ordersByMonth = Order::where('status', 'completed')
        ->with('items.product')  // eager load items
        ->orderBy('created_at', 'desc')
        ->get()
        ->groupBy(function ($order) {
            return $order->created_at->format('F Y');
        });

    foreach ($ordersByMonth as $month => $orders) {
        $monthData = [
            'month' => $month,
            'total_sales' => $orders->sum('total_price'),
            'order_count' => $orders->count(),
            'payment_methods' => [
                'cod' => $orders->where('payment_method', 'cod')->count(),
                'gcash' => $orders->where('payment_method', 'gcash')->count(),
                'paymaya' => $orders->where('payment_method', 'paymaya')->count(),
                'bank_transfer' => $orders->where('payment_method', 'bank_transfer')->count(),
            ],
            'orders' => $orders->map(function ($order) {
                // Compute subtotal (sum of all item totals)
                $subtotal = $order->items->sum(fn($item) => $item->price * $item->quantity);
                $tax = $subtotal * 0.12;   // 12% VAT on subtotal
                return [
                    'order_number' => $order->order_number,
                    'created_at' => $order->created_at->format('Y-m-d H:i'),
                    'customer_name' => $order->customer_name,
                    'payment_method' => $order->payment_method,
                    'subtotal' => $subtotal,      // <-- added
                    'shipping' => $order->shipping_cost,
                    'tax' => $tax,                // <-- added
                    'total' => $order->total_price,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'sku' => $item->product_id,  // or $item->product->sku if you have SKU field
                            'product_name' => $item->product?->name ?? 'Product not found',
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'total' => $item->price * $item->quantity,
                        ];
                    }),
                ];
            }),
        ];

        $monthlyData[] = $monthData;

        // Update grand totals
        $grandTotals['total_sales'] += $monthData['total_sales'];
        $grandTotals['total_orders'] += $monthData['order_count'];
        $grandTotals['cod_count'] += $monthData['payment_methods']['cod'];
        $grandTotals['gcash_count'] += $monthData['payment_methods']['gcash'];
        $grandTotals['paymaya_count'] += $monthData['payment_methods']['paymaya'];
        $grandTotals['bank_transfer_count'] += $monthData['payment_methods']['bank_transfer'];
    }

    $pdf = Pdf::loadView('pdf.sales-report', [
        'monthlyData' => $monthlyData,
        'grandTotals' => $grandTotals,
        'generatedAt' => now()->format('F j, Y g:i A'),
    ]);

    return $pdf->download('sales-report-' . now()->format('Y-m-d') . '.pdf');
}

}
