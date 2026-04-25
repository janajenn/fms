import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';

export default function Index({ categories }) {
    const { showToast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            description: '',
            sort_order: 0,
            is_active: true,
        });
        setEditingCategory(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            sort_order: category.sort_order,
            is_active: category.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);

        const url = editingCategory
            ? route('admin.customization-categories.update', editingCategory.id)
            : route('admin.customization-categories.store');

        const method = editingCategory ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setModalOpen(false);
                resetForm();
                showToast('success', 'Success', editingCategory ? 'Category updated.' : 'Category created.');
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                showToast('error', 'Error', 'Failed to save category.');
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
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
        </div>
    );

    // Auto-generate slug from name
    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    };

    return (
        <AdminLayout>
            <Head title="Customization Categories" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Customization Categories</h1>
                            <p className="text-stone-400 mt-1">Manage groups of customization options</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                        >
                            Add New Category
                        </button>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Slug</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Sort Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4 text-sm text-white">{category.name}</td>
                                            <td className="px-6 py-4 text-sm text-stone-300">{category.slug}</td>
                                            <td className="px-6 py-4 text-sm text-stone-400">{category.description || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-stone-300">{category.sort_order}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    category.is_active
                                                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                                                        : 'bg-red-900/30 text-red-400 border border-red-700'
                                                }`}>
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <button
                                                    onClick={() => openEditModal(category)}
                                                    className="text-amber-500 hover:text-amber-400"
                                                >
                                                    Edit
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

            {/* Create/Edit Modal */}
            <Dialog
                header={editingCategory ? 'Edit Category' : 'Create New Category'}
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
                        <label className="block text-sm font-medium text-stone-400 mb-1">Category Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setFormData({
                                    ...formData,
                                    name,
                                    slug: generateSlug(name),
                                });
                            }}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="e.g., Glass Type, Cushion Thickness"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Slug (URL-friendly)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="e.g., glass-type"
                        />
                        <p className="text-xs text-stone-500 mt-1">Auto-generated from name, but you can customize</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="2"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            placeholder="Brief description of this category"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            />
                            <p className="text-xs text-stone-500 mt-1">Lower numbers appear first</p>
                        </div>
                        <div>
                            <label className="flex items-center mt-6">
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

                    <div className="text-xs text-stone-500 bg-stone-900 p-3 rounded-lg">
                        <span className="text-amber-500">💡 Tip:</span> Categories group related customization options together. For example, "Wood Finish" groups all wood finishing options like "Dark Walnut", "Ebony", etc.
                    </div>
                </div>
            </Dialog>
        </AdminLayout>
    );
}
