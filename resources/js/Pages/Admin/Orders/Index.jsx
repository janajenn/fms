import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { confirmDialog } from 'primereact/confirmdialog';

export default function Index({ orders, stats }) {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const statusColors = {
        pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
        processing: 'bg-blue-900/30 text-blue-400 border border-blue-700',
        shipped: 'bg-indigo-900/30 text-indigo-400 border border-indigo-700',
        completed: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
        cancelled: 'bg-red-900/30 text-red-400 border border-red-700',
    };

    const formatCurrency = (value) => {
        if (!value) return '0';
        return value.toLocaleString();
    };

    const handleDelete = (order) => {
        confirmDialog({
            header: 'Delete Order',
            message: `Are you sure you want to delete Order #${order.order_number}? This action cannot be undone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                router.delete(route('admin.orders.destroy', order.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Order deleted successfully');
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete order');
                    },
                });
            },
        });
    };

    const filteredOrders = orders.data.filter(order => {
        const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AdminLayout>
            <Head title="Orders Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-white">Orders Management</h1>
                        <p className="text-stone-400 mt-1">Manage and track customer orders</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-white">{stats.total_orders}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Pending</p>
                            <p className="text-2xl font-bold text-yellow-400">{stats.pending_orders}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Processing</p>
                            <p className="text-2xl font-bold text-blue-400">{stats.processing_orders}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Shipped</p>
                            <p className="text-2xl font-bold text-indigo-400">{stats.shipped_orders || 0}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Completed</p>
                            <p className="text-2xl font-bold text-emerald-400">{stats.completed_orders}</p>
                        </div>
                        <div className="bg-black border border-stone-800 rounded-lg p-4">
                            <p className="text-stone-400 text-sm">Cancelled</p>
                            <p className="text-2xl font-bold text-red-400">{stats.cancelled_orders}</p>
                        </div>
                    </div>

                    {/* Revenue Card Separate */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-black border border-stone-800 rounded-lg p-4 md:col-span-3">
                            <p className="text-stone-400 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-amber-400">₱{formatCurrency(stats.total_revenue)}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'all'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setStatusFilter('processing')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'processing'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                Processing
                            </button>
                            <button
                                onClick={() => setStatusFilter('shipped')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'shipped'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                Shipped
                            </button>
                            <button
                                onClick={() => setStatusFilter('completed')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'completed'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setStatusFilter('cancelled')}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    statusFilter === 'cancelled'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                                }`}
                            >
                                Cancelled
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Order #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-white">#{order.order_number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{order.customer_name || order.user?.name}</div>
                                                <div className="text-xs text-stone-400">{order.customer_email || order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {order.total_items || order.items?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-white font-medium">
                                                ₱{formatCurrency(order.total_price)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('admin.orders.show', order.id)}
                                                        className="p-1.5 text-blue-500 hover:text-blue-400 transition-colors"
                                                        title="View Order"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(order)}
                                                        className="p-1.5 text-red-500 hover:text-red-400 transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredOrders.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-white">No orders found</h3>
                                <p className="mt-1 text-sm text-stone-400">No orders match your search criteria.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.links && orders.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {orders.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded text-sm transition-colors ${
                                                link.active
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
