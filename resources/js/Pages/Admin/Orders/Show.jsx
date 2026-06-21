import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { confirmDialog } from 'primereact/confirmdialog';

export default function Show({ order }) {
    const { showToast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(order.status);

    const statusColors = {
        pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
        processing: 'bg-blue-900/30 text-blue-400 border border-blue-700',
        shipped: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700',
        completed: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
        cancelled: 'bg-red-900/30 text-red-400 border border-red-700',
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'yellow' },
        // { value: 'processing', label: 'Processing', color: 'blue' },
        { value: 'shipped', label: 'Shipped', color: 'indigo' },
        { value: 'completed', label: 'Completed', color: 'emerald' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' },
    ];

    const formatCurrency = (value) => {
        if (!value) return '0';
        return value.toLocaleString();
    };

    const updateStatus = () => {
        if (selectedStatus === order.status) return;

        confirmDialog({
            header: 'Update Order Status',
            message: `Are you sure you want to change this order status to ${selectedStatus.toUpperCase()}?`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-success',
            accept: () => {
                setIsUpdating(true);
                router.put(route('admin.orders.update', order.id), { status: selectedStatus }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsUpdating(false);
                        showToast('success', 'Updated', 'Order status updated successfully');
                    },
                    onError: () => {
                        setIsUpdating(false);
                        showToast('error', 'Error', 'Failed to update order status');
                    },
                });
            },
        });
    };

    const getSubtotal = () => {
        return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getTax = () => {
        return getSubtotal() * 0.12;
    };

    const getPaymentMethodLabel = (method) => {
        const methods = {
            cod: 'Cash on Delivery',
            gcash: 'GCash',
            paymaya: 'PayMaya',
            bank_transfer: 'Bank Transfer',
        };
        return methods[method] || method.toUpperCase();
    };

    const getPaymentStatusLabel = (status) => {
        const statuses = {
            pending: 'Pending',
            pending_payment: 'Awaiting Payment',
            pending_downpayment: 'Downpayment Due',
            paid: 'Paid',
            failed: 'Failed',
            refunded: 'Refunded',
        };
        return statuses[status] || status;
    };

    return (
        <AdminLayout>
            <Head title={`Order #${order.order_number}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('admin.orders.index')}
                            className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-1 mb-4"
                        >
                            ← Back to Orders
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-white">Order #{order.order_number}</h1>
                                <p className="text-stone-400 mt-1">
                                    Placed on {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={updateStatus}
                                    disabled={isUpdating || selectedStatus === order.status}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column – Order Items (takes more space) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-stone-900 border-b border-stone-800">
                                    <h2 className="text-lg font-semibold text-white">Order Items</h2>
                                </div>
                                <div className="divide-y divide-stone-800">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="p-6">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 bg-stone-900 rounded-lg flex-shrink-0 overflow-hidden">
                                                    {item.product?.images?.[0] && (
                                                        <img
                                                            src={`/storage/${item.product.images[0].image_path}`}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-white">{item.product?.name}</h3>
                                                    {item.size && <p className="text-sm text-stone-400">Size: {item.size.size}</p>}
                                                    {item.customizations && item.customizations.length > 0 && (
                                                        <div className="text-xs text-stone-500 mt-1">
                                                            Customizations: {item.customizations.map(c => c.value).join(', ')}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center mt-2">
                                                        <div className="text-sm text-stone-400">
                                                            ₱{formatCurrency(item.price)} × {item.quantity}
                                                        </div>
                                                        <div className="text-lg font-semibold text-amber-500">
                                                            ₱{formatCurrency(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary – moved to left column to balance */}
                            <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-stone-900 border-b border-stone-800">
                                    <h2 className="text-lg font-semibold text-white">Order Summary</h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-400">Subtotal</span>
                                        <span className="text-white">₱{formatCurrency(getSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-400">Shipping</span>
                                        <span className="text-white">₱{formatCurrency(order.shipping_cost || 0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-stone-400">Tax (12% VAT)</span>
                                        <span className="text-white">₱{formatCurrency(getTax())}</span>
                                    </div>
                                    {order.down_payment_amount > 0 && order.payment_method === 'cod' && (
                                        <>
                                            <div className="flex justify-between text-sm pt-2">
                                                <span className="text-stone-400">Down Payment (30%)</span>
                                                <span className="text-emerald-400">₱{formatCurrency(order.down_payment_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-400">Remaining Balance</span>
                                                <span className="text-amber-500 font-semibold">₱{formatCurrency(order.remaining_balance)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="border-t border-stone-800 pt-3 mt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span className="text-white">Total</span>
                                            <span className="text-amber-500">₱{formatCurrency(order.total_price)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column – Customer, Payment, Status (now less cramped) */}
                        <div className="space-y-6">
                            {/* Payment Information – NEW CARD */}
                            <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-stone-900 border-b border-stone-800">
                                    <h2 className="text-lg font-semibold text-white">Payment Information</h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <p className="text-xs text-stone-400">Method</p>
                                        <p className="text-sm text-white font-medium mt-1">
                                            {getPaymentMethodLabel(order.payment_method)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400">Status</p>
                                        <p className={`text-sm font-medium mt-1 ${order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {getPaymentStatusLabel(order.payment_status)}
                                        </p>
                                    </div>
                                    {order.payment_method === 'cod' && order.down_payment_amount > 0 && (
                                        <div className="pt-2 border-t border-stone-800">
                                            <p className="text-xs text-stone-400">Down Payment</p>
                                            <p className="text-sm text-white mt-1">₱{formatCurrency(order.down_payment_amount)}</p>
                                            <p className="text-xs text-stone-400 mt-2">Remaining Balance</p>
                                            <p className="text-sm text-amber-400 mt-1">₱{formatCurrency(order.remaining_balance)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-stone-900 border-b border-stone-800">
                                    <h2 className="text-lg font-semibold text-white">Customer Information</h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <p className="text-xs text-stone-400">Name</p>
                                        <p className="text-sm text-white">{order.customer_name || order.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400">Email</p>
                                        <p className="text-sm text-white">{order.customer_email || order.user?.email}</p>
                                    </div>
                                    {order.shipping_address && (
                                        <div>
                                            <p className="text-xs text-stone-400">Shipping Address</p>
                                            <p className="text-sm text-white mt-1">
                                                {order.shipping_address.address}<br />
                                                {order.shipping_address.barangay && <>{order.shipping_address.barangay}<br /></>}
                                                {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                                                Phone: {order.shipping_address.phone}
                                            </p>
                                            {order.shipping_address.notes && (
                                                <p className="text-sm text-stone-400 mt-2">
                                                    <span className="text-stone-500">Notes:</span> {order.shipping_address.notes}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                                <div className="px-6 py-4 bg-stone-900 border-b border-stone-800">
                                    <h2 className="text-lg font-semibold text-white">Order Status</h2>
                                </div>
                                <div className="p-6">
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[order.status]}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <p className="text-xs text-stone-500 mt-2">
                                        Last updated: {new Date(order.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
