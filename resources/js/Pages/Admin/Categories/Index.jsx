import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';

export default function Index({ categories }) {
    const { showToast } = useToast();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset form when modal closes
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            sort_order: 0,
            is_active: true,
        });
        setEditingCategory(null);
        setErrors({});
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        const url = editingCategory
            ? route('admin.categories.update', editingCategory.id)
            : route('admin.categories.store');

        const method = editingCategory ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setModalVisible(false);
                resetForm();
                showToast('success', 'Success', editingCategory ? 'Category updated successfully.' : 'Category created successfully.');
                // Refresh the page to show updated list
                setTimeout(() => {
                    router.reload();
                }, 500);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.response?.data?.errors) {
                    setErrors(errors.response.data.errors);
                } else {
                    showToast('error', 'Error', 'Failed to save category.');
                }
            },
        });
    };

    const confirmDelete = (category) => {
        confirmDialog({
            header: 'Delete Category',
            message: `Are you sure you want to delete "${category.name}"? This action cannot be undone. Products in this category will become uncategorized.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            rejectClassName: 'p-button-secondary',
            accept: () => {
                router.delete(route('admin.categories.destroy', category.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Category deleted successfully.');
                        router.reload();
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete category.');
                    },
                });
            },
        });
    };

    // Dialog footer buttons
    const renderFooter = () => {
        return (
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => setModalVisible(false)}
                    className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : editingCategory ? 'Update' : 'Create'}
                </button>
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Admin - Categories" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Categories</h1>
                            <p className="text-stone-400 mt-1">Manage your product categories</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Add New Category
                        </button>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">ID</th> */}
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Products</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Sort Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black divide-y divide-stone-800">
                                    {categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-stone-900/50 transition-colors">
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-300">#{category.id}</td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-400">{category.slug}</td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-sm text-stone-400 truncate">{category.description || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-400">
                                                <span className="px-2 py-1 bg-stone-900 rounded-full text-xs">
                                                    {category.products_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                                    category.is_active
                                                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                                                        : 'bg-red-900/30 text-red-400 border border-red-700'
                                                }`}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-400">{category.sort_order}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="text-amber-500 hover:text-amber-400 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(category)}
                                                    className="text-red-500 hover:text-red-400 transition-colors"
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
                        {categories.links && categories.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {categories.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
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

            {/* Create/Edit Category Modal */}
            <Dialog
                header={editingCategory ? 'Edit Category' : 'Create New Category'}
                visible={modalVisible}
                style={{ width: '500px' }}
                onHide={() => {
                    setModalVisible(false);
                    resetForm();
                }}
                footer={renderFooter()}
                className="bg-black border border-stone-800 rounded-lg"
                modalClassName="bg-black"
            >
                <div className="space-y-4 p-2">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            placeholder="e.g., Dining Tables"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Describe this category..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.is_active ? 'active' : 'inactive'}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-xs text-stone-500 bg-stone-900 p-3 rounded-lg">
                        <span className="text-amber-500">💡 Tip:</span> Categories help organize your products. Products will automatically inherit the category's name and slug.
                    </div>
                </div>
            </Dialog>
        </AdminLayout>
    );
}
