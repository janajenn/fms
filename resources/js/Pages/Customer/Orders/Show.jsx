import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    CreditCard,
    MapPin,
    Phone,
    Mail,
    FileText,
    ChevronRight
} from 'lucide-react';

export default function Show({ order }) {
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
        if (!value) return '0';
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
        <CustomerLayout>
            <Head title={`Order #${order.order_number}`} />

            <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/customer/orders"
                            className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-sm font-medium">Back to Orders</span>
                        </Link>
                    </div>

                    {/* Order Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 md:px-8 md:py-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-xl md:text-2xl font-bold text-white">
                                            Order #{order.order_number}
                                        </h1>
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.badgeColor}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {status.label}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-orange-100">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-sm">Placed on {formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-orange-100 text-sm">Total Amount</p>
                                    <p className="text-2xl md:text-3xl font-bold text-white">
                                        ₱{formatCurrency(order.total_price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Order Items & Summary */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                    <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-amber-500" />
                                        Order Items
                                    </h2>
                                </div>
                                <div className="divide-y divide-stone-100">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="p-5 hover:bg-stone-50/50 transition-colors">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-stone-100 rounded-xl flex-shrink-0 overflow-hidden ring-1 ring-stone-200">
                                                    {item.product?.images?.[0] ? (
                                                        <img
                                                            src={`/storage/${item.product.images[0].image_path}`}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-stone-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-stone-800">{item.product?.name}</h3>
                                                    {item.size && (
                                                        <p className="text-sm text-stone-500 mt-0.5">
                                                            Size: {item.size?.size || 'N/A'}
                                                        </p>
                                                    )}
                                                    {item.customizations && item.customizations.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.customizations.map((c, idx) => (
                                                                <span key={idx} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                                                                    {c.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-stone-500 mt-2">Quantity: {item.quantity}</p>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-amber-600">
                                                        ₱{formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                    <p className="text-xs text-stone-400 mt-1">
                                                        ₱{formatCurrency(item.price)} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                    <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-amber-500" />
                                        Order Summary
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">Subtotal</span>
                                            <span className="text-stone-700 font-medium">
                                                ₱{formatCurrency(order.total_price - (order.shipping_cost || 0))}
                                            </span>
                                        </div>
                                        {order.shipping_cost > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-500">Shipping Fee</span>
                                                <span className="text-stone-700 font-medium">
                                                    ₱{formatCurrency(order.shipping_cost)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">Tax (12% VAT)</span>
                                            <span className="text-stone-700 font-medium">
                                                ₱{formatCurrency(order.total_price * 0.12)}
                                            </span>
                                        </div>
                                        <div className="border-t border-stone-200 pt-3 mt-3">
                                            <div className="flex justify-between">
                                                <span className="text-base font-semibold text-stone-800">Total</span>
                                                <span className="text-xl font-bold text-amber-600">
                                                    ₱{formatCurrency(order.total_price)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Shipping & Status Info */}
                        <div className="space-y-6">
                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                        <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-amber-500" />
                                            Shipping Address
                                        </h2>
                                    </div>
                                    <div className="p-5">
                                        <div className="space-y-2 text-sm">
                                            <p className="font-medium text-stone-800">{order.customer_name}</p>
                                            <p className="text-stone-600">{order.shipping_address.address}</p>
                                            {order.shipping_address.barangay && (
                                                <p className="text-stone-600">Barangay: {order.shipping_address.barangay}</p>
                                            )}
                                            <p className="text-stone-600">
                                                {order.shipping_address.city}, {order.shipping_address.postal_code}
                                            </p>
                                            <div className="flex items-center gap-2 pt-2">
                                                <Phone className="w-3.5 h-3.5 text-stone-400" />
                                                <span className="text-stone-600">{order.shipping_address.phone}</span>
                                            </div>
                                            {order.shipping_address.notes && (
                                                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                                                    <p className="text-xs text-amber-600 font-medium mb-1">Delivery Notes:</p>
                                                    <p className="text-sm text-stone-600">{order.shipping_address.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Customer Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                    <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-amber-500" />
                                        Customer Information
                                    </h2>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wide">Contact Person</p>
                                        <p className="text-sm font-medium text-stone-800 mt-0.5">{order.customer_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wide">Email Address</p>
                                        <p className="text-sm text-stone-600 mt-0.5">{order.customer_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wide">Order Date</p>
                                        <p className="text-sm text-stone-600 mt-0.5">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status Timeline */}
                            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                                    <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-amber-500" />
                                        Order Status
                                    </h2>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.bgColor}`}>
                                                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-stone-800">{status.label}</p>
                                                <p className="text-xs text-stone-500">Last updated: {formatDate(order.updated_at)}</p>
                                            </div>
                                        </div>

                                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                                            <div className="pt-2">
                                                <div className="text-xs text-stone-500 mb-1">Estimated delivery</div>
                                                <div className="flex items-center gap-2 text-sm text-stone-700">
                                                    <Calendar className="w-4 h-4 text-amber-500" />
                                                    <span>
                                                        {new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)).toLocaleDateString('en-PH', {
                                                            weekday: 'long',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Need Help? */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                                <h3 className="font-semibold text-stone-800 mb-2">Need help with your order?</h3>
                                <p className="text-sm text-stone-600 mb-3">
                                    Our customer support team is ready to assist you.
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                                >
                                    Contact Support
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
