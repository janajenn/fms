import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingBag,
    Package,
    CreditCard,
    AlertTriangle,
    Star,
    Eye,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Dashboard({
    stats,
    comparisonData,
    bestSellingProducts,
    lowStockProducts,
    recentOrders,
    orderStatusCounts,
    salesChartData,
    availableYears,
    currentPeriod
}) {
    // Safe defaults for currentPeriod
    const safePeriod = currentPeriod || { period: 'monthly', year: new Date().getFullYear(), month: new Date().getMonth() + 1, week: 1 };

    const [period, setPeriod] = useState(safePeriod.period);
    const [year, setYear] = useState(safePeriod.year);
    const [month, setMonth] = useState(safePeriod.month);
    const [week, setWeek] = useState(safePeriod.week);

    // Safe defaults for stats
    const safeStats = stats || {
        totalUsers: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        conversionRate: 0
    };

    // Safe defaults for comparisonData
    const safeComparison = comparisonData || {
        current: { revenue: 0, orders: 0, customers: 0 },
        previous: { revenue: 0, orders: 0, customers: 0 },
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0
    };

    // Safe defaults for arrays
    const safeBestSelling = bestSellingProducts || [];
    const safeLowStock = lowStockProducts || [];
    const safeRecentOrders = recentOrders || [];
    const safeAvailableYears = availableYears || [new Date().getFullYear()];

    const statusColors = {
        pending: 'bg-amber-900/30 text-amber-400 border border-amber-700',
        processing: 'bg-blue-900/30 text-blue-400 border border-blue-700',
        shipped: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700',
        completed: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
        cancelled: 'bg-red-900/30 text-red-400 border border-red-700',
    };

    const updateFilter = (newPeriod, newYear, newMonth, newWeek) => {
        router.get(route('admin.dashboard'), {
            period: newPeriod,
            year: newYear,
            month: newMonth,
            week: newWeek,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getGrowthColor = (growth) => {
        if (growth > 0) return 'text-emerald-500';
        if (growth < 0) return 'text-red-500';
        return 'text-stone-400';
    };

    const getGrowthIcon = (growth) => {
        if (growth > 0) return <TrendingUp className="w-3 h-3" />;
        if (growth < 0) return <TrendingDown className="w-3 h-3" />;
        return null;
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Load Chart.js dynamically to avoid SSR issues
    useEffect(() => {
        const loadChart = async () => {
            if (salesChartData && salesChartData.labels && salesChartData.labels.length > 0) {
                const { Chart, registerables } = await import('chart.js');
                Chart.register(...registerables);

                const ctx = document.getElementById('salesChart')?.getContext('2d');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: salesChartData.labels,
                            datasets: [{
                                label: 'Revenue (₱)',
                                data: salesChartData.revenue,
                                borderColor: '#D2691E',
                                backgroundColor: 'rgba(210, 105, 30, 0.1)',
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#D2691E',
                                pointBorderColor: '#fff',
                                pointRadius: 4,
                                pointHoverRadius: 6,
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    labels: { color: '#E5E5E5' }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return `₱${context.parsed.y.toLocaleString()}`;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    ticks: { color: '#A0A0A0' },
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                },
                                x: {
                                    ticks: { color: '#A0A0A0' },
                                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                                }
                            }
                        }
                    });
                }
            }
        };

        loadChart();
    }, [salesChartData]);

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                        <p className="text-stone-400">Welcome back! Here's what's happening with your store today.</p>
                    </div>

                    {/* Stats Grid - Better arranged and wider */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
    {/* Total Users */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{safeStats.totalUsers}</p>
                <p className="text-xs text-stone-500 mt-2">Registered accounts</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-3 group-hover:bg-stone-700 transition-colors">
                <Users className="h-6 w-6 text-stone-400" />
            </div>
        </div>
    </div>

    {/* Total Customers */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-white">{safeStats.totalCustomers}</p>
                <p className="text-xs text-emerald-500 mt-2">Conversion: {safeStats.conversionRate}%</p>
            </div>
            <div className="bg-emerald-900/30 rounded-xl p-3 group-hover:bg-emerald-800/30 transition-colors">
                <Users className="h-6 w-6 text-emerald-500" />
            </div>
        </div>
    </div>

    {/* Total Products */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-white">{safeStats.totalProducts}</p>
                <p className="text-xs text-stone-500 mt-2">Active products</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-3 group-hover:bg-stone-700 transition-colors">
                <Package className="h-6 w-6 text-stone-400" />
            </div>
        </div>
    </div>

    {/* Total Orders */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{safeStats.totalOrders}</p>
                <p className="text-xs text-stone-500 mt-2">Lifetime orders</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-3 group-hover:bg-stone-700 transition-colors">
                <ShoppingBag className="h-6 w-6 text-stone-400" />
            </div>
        </div>
    </div>

    {/* Total Revenue */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-amber-500">₱{safeStats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-stone-500 mt-2">From all orders</p>
            </div>
            <div className="bg-amber-900/30 rounded-xl p-3 group-hover:bg-amber-800/30 transition-colors">
                <CreditCard className="h-6 w-6 text-amber-500" />
            </div>
        </div>
    </div>

    {/* Average Order Value */}
    <div className="bg-black border border-stone-800 rounded-lg p-5 hover:border-amber-800 transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-stone-400 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-white">
                    ₱{(safeStats.totalRevenue / (safeStats.totalOrders || 1)).toLocaleString()}
                </p>
                <p className="text-xs text-stone-500 mt-2">Per transaction</p>
            </div>
            <div className="bg-stone-800 rounded-xl p-3 group-hover:bg-stone-700 transition-colors">
                <TrendingUp className="h-6 w-6 text-stone-400" />
            </div>
        </div>
    </div>
</div>

                    {/* Comparison Section with Filters */}
                    <div className="bg-black border border-stone-800 rounded-lg mb-8">
                        <div className="px-6 py-4 border-b border-stone-800">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-white">Performance Comparison</h3>
                                    <p className="text-sm text-stone-400 mt-1">Compare current vs previous period</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => {
                                            setPeriod('weekly');
                                            updateFilter('weekly', year, month, week);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            period === 'weekly'
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                        }`}
                                    >
                                        Weekly
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPeriod('monthly');
                                            updateFilter('monthly', year, month, week);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            period === 'monthly'
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPeriod('yearly');
                                            updateFilter('yearly', year, month, week);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                            period === 'yearly'
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                        }`}
                                    >
                                        Yearly
                                    </button>
                                </div>
                            </div>

                            {/* Period Specific Filters */}
                            <div className="mt-4 flex flex-wrap gap-3">
                                <select
                                    value={year}
                                    onChange={(e) => {
                                        setYear(parseInt(e.target.value));
                                        updateFilter(period, parseInt(e.target.value), month, week);
                                    }}
                                    className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                                >
                                    {safeAvailableYears.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>

                                {period === 'monthly' && (
                                    <select
                                        value={month}
                                        onChange={(e) => {
                                            setMonth(parseInt(e.target.value));
                                            updateFilter(period, year, parseInt(e.target.value), week);
                                        }}
                                        className="px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
                                    >
                                        {months.map((m, idx) => (
                                            <option key={idx + 1} value={idx + 1}>{m}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-stone-900/50 rounded-lg">
                                    <p className="text-sm text-stone-400 mb-2">Revenue</p>
                                    <p className="text-2xl font-bold text-amber-500">₱{safeComparison.current.revenue.toLocaleString()}</p>
                                    <p className="text-xs mt-2">
                                        <span className={getGrowthColor(safeComparison.revenueGrowth)}>
                                            {getGrowthIcon(safeComparison.revenueGrowth)}
                                            {safeComparison.revenueGrowth > 0 ? '+' : ''}{safeComparison.revenueGrowth}%
                                        </span>
                                        <span className="text-stone-500 ml-1">vs previous</span>
                                    </p>
                                    <p className="text-xs text-stone-500 mt-2">
                                        Previous: ₱{safeComparison.previous.revenue.toLocaleString()}
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-stone-900/50 rounded-lg">
                                    <p className="text-sm text-stone-400 mb-2">Orders</p>
                                    <p className="text-2xl font-bold text-white">{safeComparison.current.orders}</p>
                                    <p className="text-xs mt-2">
                                        <span className={getGrowthColor(safeComparison.ordersGrowth)}>
                                            {getGrowthIcon(safeComparison.ordersGrowth)}
                                            {safeComparison.ordersGrowth > 0 ? '+' : ''}{safeComparison.ordersGrowth}%
                                        </span>
                                        <span className="text-stone-500 ml-1">vs previous</span>
                                    </p>
                                    <p className="text-xs text-stone-500 mt-2">
                                        Previous: {safeComparison.previous.orders}
                                    </p>
                                </div>

                                <div className="text-center p-4 bg-stone-900/50 rounded-lg">
                                    <p className="text-sm text-stone-400 mb-2">New Customers</p>
                                    <p className="text-2xl font-bold text-white">{safeComparison.current.customers}</p>
                                    <p className="text-xs mt-2">
                                        <span className={getGrowthColor(safeComparison.customersGrowth)}>
                                            {getGrowthIcon(safeComparison.customersGrowth)}
                                            {safeComparison.customersGrowth > 0 ? '+' : ''}{safeComparison.customersGrowth}%
                                        </span>
                                        <span className="text-stone-500 ml-1">vs previous</span>
                                    </p>
                                    <p className="text-xs text-stone-500 mt-2">
                                        Previous: {safeComparison.previous.customers}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Chart */}
                    {salesChartData && salesChartData.labels && salesChartData.labels.length > 0 && (
                        <div className="bg-black border border-stone-800 rounded-lg mb-8">
                            <div className="px-6 py-4 border-b border-stone-800">
                                <h3 className="text-lg font-medium text-white">Sales Overview</h3>
                                <p className="text-sm text-stone-400 mt-1">
                                    {period === 'weekly' ? 'Daily sales for selected week' :
                                     period === 'monthly' ? 'Daily sales for selected month' :
                                     'Monthly sales for selected year'}
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="h-80">
                                    <canvas id="salesChart"></canvas>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Best Selling Products */}
                        <div className="bg-black border border-stone-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-stone-800">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    Best Selling Products
                                </h3>
                                <p className="text-sm text-stone-400 mt-1">Top products by quantity sold</p>
                            </div>
                            <div className="divide-y divide-stone-800">
                                {safeBestSelling.length > 0 ? (
                                    safeBestSelling.map((product, index) => (
                                        <div key={product.id} className="px-6 py-4 hover:bg-stone-900/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-amber-900/30 rounded-full flex items-center justify-center">
                                                        <span className="text-amber-500 font-bold">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{product.name}</p>
                                                        <p className="text-xs text-stone-400 mt-1">
                                                            {product.total_quantity} sold • ₱{product.total_revenue.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                                                >
                                                    View →
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center text-stone-400">
                                        No sales data available yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Low Stock Products */}
                        <div className="bg-black border border-stone-800 rounded-lg">
                            <div className="px-6 py-4 border-b border-stone-800">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Low Stock Alert
                                </h3>
                                <p className="text-sm text-stone-400 mt-1">Products running low on inventory</p>
                            </div>
                            <div className="divide-y divide-stone-800">
                                {safeLowStock.length > 0 ? (
                                    safeLowStock.map((product) => (
                                        <div key={product.id} className="px-6 py-4 hover:bg-stone-900/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{product.name}</p>
                                                    <p className="text-xs text-red-400 mt-1">
                                                        Stock: {product.stock} units left
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                                                >
                                                    Restock →
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-8 text-center text-stone-400">
                                        All products have sufficient stock
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </AdminLayout>
    );
}
