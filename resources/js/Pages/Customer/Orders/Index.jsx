import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Eye, Calendar, CreditCard } from 'lucide-react';

export default function Index({ orders }) {
    const statusConfig = {
        pending: {
            label: 'Pending',
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            badgeColor: 'bg-amber-100 text-amber-700'
        },
        processing: {
            label: 'Processing',
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            badgeColor: 'bg-blue-100 text-blue-700'
        },
        shipped: {
            label: 'Shipped',
            icon: Truck,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            badgeColor: 'bg-indigo-100 text-indigo-700'
        },
        completed: {
            label: 'Delivered',
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            badgeColor: 'bg-emerald-100 text-emerald-700'
        },
        cancelled: {
            label: 'Cancelled',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            badgeColor: 'bg-red-100 text-red-700'
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getOrderProgress = (status) => {
        const steps = ['pending', 'processing', 'shipped', 'completed'];
        const currentIndex = steps.indexOf(status);
        if (currentIndex === -1) return 0;
        return ((currentIndex + 1) / steps.length) * 100;
    };

    return (
        <CustomerLayout>
            <Head title="My Orders" />

            <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Header Section */}
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
                                    My Orders
                                </h1>
                                <p className="text-stone-500 mt-1 text-sm">
                                    Track and manage all your orders in one place
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium w-fit"
                            >
                                <Package className="w-4 h-4" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {orders.data.length === 0 ? (
                        // Empty State - Modern Design
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 md:p-12 text-center">
                            <div className="max-w-sm mx-auto">
                                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-12 h-12 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-stone-800 mb-2">No orders yet</h3>
                                <p className="text-stone-500 mb-6">
                                    Looks like you haven't placed any orders. Start exploring our collection!
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium"
                                >
                                    Browse Products
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Orders List */}
                            <div className="space-y-6">
                                {orders.data.map((order) => {
                                    const status = statusConfig[order.status] || statusConfig.pending;
                                    const StatusIcon = status.icon;
                                    const progress = getOrderProgress(order.status);

                                    return (
                                        <div key={order.id} className="group">
                                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-all duration-300">
                                                {/* Order Header */}
                                                <div className="px-5 py-4 md:px-6 md:py-5 border-b border-stone-100 bg-stone-50/50">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-lg ${status.bgColor}`}>
                                                                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                                                </div>
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.badgeColor}`}>
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <div className="h-4 w-px bg-stone-200 hidden sm:block" />
                                                            <div className="flex items-center gap-1 text-sm text-stone-500">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span>{formatDate(order.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-xs text-stone-500">Total Amount</p>
                                                                <p className="text-xl font-bold text-amber-600">
                                                                    ₱{formatCurrency(order.total_price)}
                                                                </p>
                                                            </div>
                                                            <Link
                                                                href={`/customer/orders/${order.id}`}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                                                            >
                                                                View Details
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="px-5 py-4 md:px-6">
                                                    {/* Order Number */}
                                                    <div className="mb-4 pb-3 border-b border-stone-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-stone-400">Order ID:</span>
                                                            <span className="text-sm font-mono font-medium text-stone-700">
                                                                #{order.order_number}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Items Grid */}
                                                    <div className="flex flex-wrap gap-4">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <div key={item.id} className="flex items-center gap-3">
                                                                <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden ring-1 ring-stone-200">
                                                                    {item.product?.images?.[0] ? (
                                                                        <img
                                                                            src={`/storage/${item.product.images[0].image_path}`}
                                                                            alt={item.product.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                                                            <Package className="w-6 h-6 text-stone-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-stone-800 line-clamp-1">
                                                                        {item.product?.name}
                                                                    </p>
                                                                    <p className="text-xs text-stone-500">
                                                                        Qty: {item.quantity}
                                                                    </p>
                                                                </div>
                                                                {idx < order.items.slice(0, 3).length - 1 && (
                                                                    <div className="hidden sm:block w-px h-8 bg-stone-200 mx-2" />
                                                                )}
                                                            </div>
                                                        ))}

                                                        {order.items.length > 3 && (
                                                            <div className="flex items-center">
                                                                <div className="bg-stone-100 rounded-xl px-3 py-2 text-center min-w-[60px]">
                                                                    <p className="text-sm font-medium text-stone-600">
                                                                        +{order.items.length - 3}
                                                                    </p>
                                                                    <p className="text-xs text-stone-400">more</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar (for active orders) */}
                                                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                        <div className="mt-5 pt-3">
                                                            <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                                                                <span>Order Progress</span>
                                                                <span>{Math.round(progress)}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination - Modern Design */}
                            {orders.links && orders.links.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-2">
                                        {orders.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`
                                                    min-w-[36px] h-9 px-3 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200
                                                    ${link.active
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                                    }
                                                    ${!link.url && 'opacity-40 cursor-not-allowed'}
                                                `}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
