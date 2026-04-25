import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router,Link  } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';

export default function Requests({ requests, zones }) {
    const { showToast } = useToast();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        admin_notes: '',
        added_to_zone_id: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');

    const statusColors = {
        pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
        contacted: 'bg-blue-900/30 text-blue-400 border border-blue-700',
        added_to_zone: 'bg-emerald-900/30 text-emerald-400 border border-emerald-700',
        rejected: 'bg-red-900/30 text-red-400 border border-red-700',
    };

    const statusLabels = {
        pending: 'Pending',
        contacted: 'Contacted',
        added_to_zone: 'Added to Zone',
        rejected: 'Rejected',
    };

    const openUpdateModal = (request) => {
        setSelectedRequest(request);
        setFormData({
            status: request.status,
            admin_notes: request.admin_notes || '',
            added_to_zone_id: request.added_to_zone_id || '',
        });
        setModalOpen(true);
    };

    const handleUpdate = () => {
        setIsSubmitting(true);

        router.put(route('admin.delivery-requests.update', selectedRequest.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setModalOpen(false);
                showToast('success', 'Updated', 'Request updated successfully');
            },
            onError: () => {
                setIsSubmitting(false);
                showToast('error', 'Error', 'Failed to update request');
            },
        });
    };

    const handleDelete = (request) => {
        confirmDialog({
            header: 'Delete Request',
            message: `Are you sure you want to delete request from ${request.customer_name}?`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                router.delete(route('admin.delivery-requests.destroy', request.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Request deleted successfully');
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete request');
                    },
                });
            },
        });
    };

    const filteredRequests = requests.data.filter(request => {
        if (filter === 'all') return true;
        return request.status === filter;
    });

    const modalFooter = (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : 'Update Request'}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Delivery Requests" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Delivery Requests</h1>
                            <p className="text-stone-400 mt-1">Manage customer requests for new delivery areas</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('contacted')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'contacted' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                        >
                            Contacted
                        </button>
                        <button
                            onClick={() => setFilter('added_to_zone')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'added_to_zone' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                        >
                            Added to Zone
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === 'rejected' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
                        >
                            Rejected
                        </button>
                    </div>

                    {/* Requests Table */}
                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{request.customer_name}</div>
                                                {request.customer_email && (
                                                    <div className="text-xs text-stone-400">{request.customer_email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">{request.customer_phone}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{request.requested_city}</div>
                                                {request.requested_barangay && (
                                                    <div className="text-xs text-stone-400">{request.requested_barangay}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                                                    {statusLabels[request.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openUpdateModal(request)}
                                                        className="p-1.5 text-amber-500 hover:text-amber-400 transition-colors"
                                                        title="Update Status"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(request)}
                                                        className="p-1.5 text-red-500 hover:text-red-400 transition-colors"
                                                        title="Delete"
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

                        {filteredRequests.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-white">No delivery requests</h3>
                                <p className="mt-1 text-sm text-stone-400">Customers will appear here when they request delivery to new areas.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {requests.links && requests.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {requests.links.map((link, index) => (
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

            {/* Update Request Modal */}
            <Dialog
                header={`Update Request - ${selectedRequest?.customer_name}`}
                visible={modalOpen}
                style={{ width: '500px' }}
                onHide={() => setModalOpen(false)}
                footer={modalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Status *</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="added_to_zone">Added to Zone</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    {formData.status === 'added_to_zone' && (
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Add to Zone</label>
                            <select
                                value={formData.added_to_zone_id}
                                onChange={(e) => setFormData({ ...formData, added_to_zone_id: e.target.value })}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="">Select a zone</option>
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} (₱{zone.delivery_fee.toLocaleString()})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-stone-500 mt-1">
                                This will add the customer's location to the selected zone for future deliveries
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Admin Notes</label>
                        <textarea
                            value={formData.admin_notes}
                            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                            rows="4"
                            placeholder="Add notes about this request..."
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    {selectedRequest && (
                        <div className="bg-stone-900 rounded-lg p-3 space-y-1">
                            <p className="text-xs text-stone-400">Customer Request Details:</p>
                            <p className="text-xs text-stone-300"><strong>Full Address:</strong> {selectedRequest.full_address}</p>
                            {selectedRequest.notes && (
                                <p className="text-xs text-stone-300"><strong>Customer Notes:</strong> {selectedRequest.notes}</p>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>
        </AdminLayout>
    );
}
