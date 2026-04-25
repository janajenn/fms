<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get filter parameters from request with defaults
        $period = request()->get('period', 'monthly');
        $year = request()->get('year', Carbon::now()->year);
        $month = request()->get('month', Carbon::now()->month);
        $week = request()->get('week', Carbon::now()->weekOfYear);

        // Basic stats
        $totalUsers = User::where('is_admin', false)->count();

        // Count customers who have made at least one order (using orders table directly)
        $totalCustomers = Order::whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        $totalProducts = Product::count();
        $totalOrders = Order::count();

        // Get total revenue from ALL orders (not just completed)
        $totalRevenue = Order::sum('total_price');

        // Get comparison data based on period (using ALL orders)
        $comparisonData = $this->getComparisonData($period, $year, $month, $week);

        // Best selling products
       // Best selling products - Only include products that still exist
$bestSellingProducts = OrderItem::select(
        'product_id',
        DB::raw('SUM(quantity) as total_quantity'),
        DB::raw('SUM(price * quantity) as total_revenue')
    )
    ->with('product')
    ->whereHas('product', function($query) {
        $query->whereNotNull('id'); // Only include order items where product still exists
    })
    ->groupBy('product_id')
    ->orderBy('total_quantity', 'desc')
    ->limit(5)
    ->get()
    ->map(function ($item) {
        // Skip if product is null (safety check)
        if (!$item->product) {
            return null;
        }
        return [
            'id' => $item->product_id,
            'name' => $item->product->name,
            'total_quantity' => $item->total_quantity,
            'total_revenue' => $item->total_revenue,
            'image' => $item->product->images->first()?->image_path ?? null,
        ];
    })
    ->filter() // Remove null entries
    ->values(); // Reindex array

        // Low stock products
        $lowStockProducts = Product::with('inventory', 'images', 'sizes')
            ->get()
            ->filter(function ($product) {
                if ($product->inventory) {
                    return $product->inventory->stock <= $product->inventory->minimum_stock;
                }
                if ($product->sizes && $product->sizes->count() > 0) {
                    return $product->sizes->sum('stock') <= 5;
                }
                return false;
            })
            ->take(10)
            ->map(function ($product) {
                $stock = $product->inventory ? $product->inventory->stock : 0;
                if ($product->sizes && $product->sizes->count() > 0) {
                    $stock = $product->sizes->sum('stock');
                }
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => $stock,
                    'minimum_stock' => $product->inventory?->minimum_stock ?? 5,
                ];
            })
            ->values();

        // Recent orders
        $recentOrders = Order::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total_price' => $order->total_price,
                    'created_at' => $order->created_at,
                    'user' => $order->user,
                    'customer_name' => $order->customer_name,
                ];
            });

        // Order status counts
        $orderStatusCounts = [
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        // Get sales data for chart based on period (using ALL orders)
        $salesChartData = $this->getSalesChartData($period, $year, $month, $week);

        // Get available years for filter
        $availableYears = Order::select(DB::raw('YEAR(created_at) as year'))
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [Carbon::now()->year];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalRevenue' => $totalRevenue,
                'conversionRate' => $totalUsers > 0 ? round(($totalCustomers / $totalUsers) * 100, 1) : 0,
            ],
            'comparisonData' => $comparisonData,
            'bestSellingProducts' => $bestSellingProducts,
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => $recentOrders,
            'orderStatusCounts' => $orderStatusCounts,
            'salesChartData' => $salesChartData,
            'availableYears' => $availableYears,
            'currentPeriod' => [
                'period' => $period,
                'year' => $year,
                'month' => $month,
                'week' => $week,
            ],
        ]);
    }

    private function getComparisonData($period, $year, $month, $week)
    {
        $currentPeriod = $this->getPeriodData($period, $year, $month, $week);
        $previousPeriod = $this->getPreviousPeriodData($period, $year, $month, $week);

        return [
            'current' => $currentPeriod,
            'previous' => $previousPeriod,
            'revenueGrowth' => $this->calculateGrowth($currentPeriod['revenue'], $previousPeriod['revenue']),
            'ordersGrowth' => $this->calculateGrowth($currentPeriod['orders'], $previousPeriod['orders']),
            'customersGrowth' => $this->calculateGrowth($currentPeriod['customers'], $previousPeriod['customers']),
        ];
    }

    private function getPeriodData($period, $year, $month, $week)
    {
        $query = Order::query(); // Removed the status filter - include ALL orders

        switch ($period) {
            case 'weekly':
                $startDate = Carbon::now()->setISODate($year, $week)->startOfWeek();
                $endDate = Carbon::now()->setISODate($year, $week)->endOfWeek();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
            case 'monthly':
                $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                $endDate = Carbon::create($year, $month, 1)->endOfMonth();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
            case 'yearly':
                $startDate = Carbon::create($year, 1, 1)->startOfYear();
                $endDate = Carbon::create($year, 12, 31)->endOfYear();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
            default:
                $startDate = Carbon::create($year, $month, 1)->startOfMonth();
                $endDate = Carbon::create($year, $month, 1)->endOfMonth();
                $query->whereBetween('created_at', [$startDate, $endDate]);
                break;
        }

        $revenue = $query->sum('total_price');
        $orders = $query->count();

        // Get unique customers in this period
        $customers = Order::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('user_id')
            ->distinct('user_id')
            ->count('user_id');

        return [
            'revenue' => $revenue,
            'orders' => $orders,
            'customers' => $customers,
        ];
    }

    private function getPreviousPeriodData($period, $year, $month, $week)
    {
        switch ($period) {
            case 'weekly':
                $previousYear = $year;
                $previousWeek = $week - 1;
                if ($previousWeek < 1) {
                    $previousYear = $year - 1;
                    $previousWeek = 52;
                }
                return $this->getPeriodData($period, $previousYear, 1, $previousWeek);
            case 'monthly':
                $previousMonth = $month - 1;
                $previousYear = $year;
                if ($previousMonth < 1) {
                    $previousMonth = 12;
                    $previousYear = $year - 1;
                }
                return $this->getPeriodData($period, $previousYear, $previousMonth, 1);
            case 'yearly':
                return $this->getPeriodData($period, $year - 1, 1, 1);
            default:
                return $this->getPeriodData($period, $year, $month, $week);
        }
    }

    private function getSalesChartData($period, $year, $month, $week)
    {
        $data = [
            'labels' => [],
            'revenue' => []
        ];

        switch ($period) {
            case 'weekly':
                // Get daily data for the week
                $startDate = Carbon::now()->setISODate($year, $week)->startOfWeek();
                for ($i = 0; $i < 7; $i++) {
                    $date = $startDate->copy()->addDays($i);
                    $revenue = Order::whereDate('created_at', $date)->sum('total_price');
                    $data['labels'][] = $date->format('D, M d');
                    $data['revenue'][] = $revenue;
                }
                break;
            case 'monthly':
                // Get daily data for the month
                $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $date = Carbon::create($year, $month, $day);
                    $revenue = Order::whereDate('created_at', $date)->sum('total_price');
                    $data['labels'][] = $date->format('M d');
                    $data['revenue'][] = $revenue;
                }
                break;
            case 'yearly':
                // Get monthly data for the year
                for ($monthNum = 1; $monthNum <= 12; $monthNum++) {
                    $startDate = Carbon::create($year, $monthNum, 1)->startOfMonth();
                    $endDate = Carbon::create($year, $monthNum, 1)->endOfMonth();
                    $revenue = Order::whereBetween('created_at', [$startDate, $endDate])->sum('total_price');
                    $data['labels'][] = Carbon::create()->month($monthNum)->format('M');
                    $data['revenue'][] = $revenue;
                }
                break;
            default:
                // Default to monthly
                $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $date = Carbon::create($year, $month, $day);
                    $revenue = Order::whereDate('created_at', $date)->sum('total_price');
                    $data['labels'][] = $date->format('M d');
                    $data['revenue'][] = $revenue;
                }
                break;
        }

        return $data;
    }

    private function calculateGrowth($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
