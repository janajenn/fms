import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import OrderTracking from '@/Components/OrderTracking';
import { useState, useEffect } from 'react';

export default function Dashboard({ recentOrders, stats, pendingDeliveryCount }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const statusColors = {
        pending: 'bg-amber-100 text-amber-800',
        processing: 'bg-blue-100 text-blue-800',
        shipped: 'bg-indigo-100 text-indigo-800',
        completed: 'bg-emerald-100 text-emerald-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const statusBadgeColors = {
        pending: 'bg-amber-500/10 text-amber-600 border border-amber-200',
        processing: 'bg-blue-500/10 text-blue-600 border border-blue-200',
        shipped: 'bg-indigo-500/10 text-indigo-600 border border-indigo-200',
        completed: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
        cancelled: 'bg-red-500/10 text-red-600 border border-red-200',
    };

    return (
        <CustomerLayout>
            <Head title="My Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">

                    {/* Welcome Section - Mobile Optimized */}
                    <div className="mb-6 md:mb-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 md:p-6 lg:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-stone-800 mb-1">
                                        Welcome back! 👋
                                    </h1>
                                    <p className="text-sm text-stone-500">
                                        Track your orders and manage your account
                                    </p>
                                </div>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards - Mobile Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-stone-500 mb-1">Total Orders</p>
                                    <p className="text-3xl md:text-4xl font-bold text-stone-800">{stats.totalOrders}</p>
                                    <p className="text-xs text-stone-400 mt-2">Lifetime orders</p>
                                </div>
                                <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-stone-500 mb-1">Total Spent</p>
                                    <p className="text-2xl md:text-3xl font-bold text-amber-600">
                                        ₱{stats.totalSpent.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-2">Lifetime spending</p>
                                </div>
                                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Orders with Progress Tracker */}
                    {recentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                        <div className="mb-6 md:mb-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="px-5 md:px-6 py-4 border-b border-stone-100">
                                    <h3 className="text-base md:text-lg font-semibold text-stone-800">Active Orders</h3>
                                    <p className="text-xs md:text-sm text-stone-500 mt-0.5">Track your ongoing deliveries</p>
                                </div>
                                <div className="divide-y divide-stone-100">
                                    {recentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').slice(0, 2).map((order) => (
                                        <div key={order.id} className="p-5 md:p-6">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-semibold text-stone-800">
                                                            Order #{order.order_number || order.id}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeColors[order.status]}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-400 mt-1">
                                                        Placed on {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-bold text-amber-600">
                                                        ₱{order.total_price.toLocaleString()}
                                                    </p>
                                                    <Link
                                                        href={`/customer/orders/${order.id}`}
                                                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                                    >
                                                        View Details →
                                                    </Link>
                                                </div>
                                            </div>
                                            <OrderTracking
                                                status={order.status}
                                                createdAt={order.created_at}
                                                estimatedDelivery={order.estimated_delivery}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Quick Actions - Mobile Optimized Grid */}
                    <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <Link
                            href="/products"
                            className="group bg-white rounded-xl shadow-sm border border-stone-100 p-4 hover:shadow-md transition-all duration-300 text-center"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-200 transition-colors">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-stone-800 mb-0.5">Shop Now</h3>
                            <p className="text-xs text-stone-500">Browse collection</p>
                        </Link>

                        <Link
                            href="/customer/orders"
                            className="group bg-white rounded-xl shadow-sm border border-stone-100 p-4 hover:shadow-md transition-all duration-300 text-center"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-stone-800 mb-0.5">Order History</h3>
                            <p className="text-xs text-stone-500">Track orders</p>
                        </Link>

                        <Link
                            href="/customer/profile"
                            className="group bg-white rounded-xl shadow-sm border border-stone-100 p-4 hover:shadow-md transition-all duration-300 text-center"
                        >
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-emerald-200 transition-colors">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-medium text-stone-800 mb-0.5">Account</h3>
                            <p className="text-xs text-stone-500">Manage profile</p>
                        </Link>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
