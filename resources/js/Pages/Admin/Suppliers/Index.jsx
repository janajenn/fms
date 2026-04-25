import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { useToast } from '@/Contexts/ToastContext';

export default function Index({ suppliers }) {
    const { showToast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        contact_number: '',
        address: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setFormData({
            name: '',
            contact_person: '',
            contact_number: '',
            address: '',
            is_active: true,
        });
        setEditingSupplier(null);
        setErrors({});
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            contact_number: supplier.contact_number || '',
            address: supplier.address || '',
            is_active: supplier.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        const url = editingSupplier
            ? route('admin.suppliers.update', editingSupplier.id)
            : route('admin.suppliers.store');

        const method = editingSupplier ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setModalOpen(false);
                resetForm();
                showToast('success', 'Success', editingSupplier ? 'Supplier updated.' : 'Supplier created.');
                router.reload();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.response?.data?.errors) {
                    setErrors(errors.response.data.errors);
                } else {
                    showToast('error', 'Error', 'Failed to save supplier.');
                }
            },
        });
    };

    const confirmDelete = (supplier) => {
        confirmDialog({
            header: 'Delete Supplier',
            message: `Are you sure you want to delete "${supplier.name}"?`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.suppliers.destroy', supplier.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Supplier deleted successfully.');
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete supplier.');
                    },
                });
            },
        });
    };

    const modalFooter = () => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Suppliers" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Suppliers</h1>
                            <p className="text-stone-400 mt-1">Manage your material suppliers</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Add New Supplier
                        </button>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Supplier</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Contact Person</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Contact Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Materials</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {suppliers.data.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{supplier.name}</div>
                                                {supplier.address && (
                                                    <div className="text-xs text-stone-500 mt-1">{supplier.address}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {supplier.contact_person || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {supplier.contact_number || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                <span className="px-2 py-1 bg-stone-800 rounded-full text-xs">
                                                    {supplier.materials_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    supplier.is_active
                                                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                                                        : 'bg-red-900/30 text-red-400 border border-red-700'
                                                }`}>
                                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <button
                                                    onClick={() => openEditModal(supplier)}
                                                    className="text-amber-500 hover:text-amber-400"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(supplier)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {suppliers.links && suppliers.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {suppliers.links.map((link, index) => (
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

            {/* Create/Edit Supplier Modal */}
            <Dialog
                header={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                visible={modalOpen}
                style={{ width: '500px' }}
                onHide={() => {
                    setModalOpen(false);
                    resetForm();
                }}
                footer={modalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Supplier Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="e.g., ABC Leather Supplies"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Contact Person
                        </label>
                        <input
                            type="text"
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Contact person name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            value={formData.contact_number}
                            onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Phone or mobile number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            rows="2"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Supplier address"
                        />
                    </div>

                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="rounded bg-stone-900 border-stone-700 text-amber-600 focus:ring-amber-500"
                            />
                            <span className="ml-2 text-sm text-stone-300">Active</span>
                        </label>
                    </div>
                </div>
            </Dialog>
        </AdminLayout>
    );
}
