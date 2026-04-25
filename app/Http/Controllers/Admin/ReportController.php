<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use Barryvdh\DomPDF\Facade\Pdf;
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


}
