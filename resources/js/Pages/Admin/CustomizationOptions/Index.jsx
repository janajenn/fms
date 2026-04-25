import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';

export default function Index({ options, categories, materials }) {
    const { showToast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price_modifier: 0,
    material_id: '',
    quantity_used: 1,
    color_code: '',
    preview_image: null,  // ← ADD THIS
    is_active: true,
});


    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
    setFormData({
        category_id: '',
        name: '',
        description: '',
        price_modifier: 0,
        material_id: '',
        quantity_used: 1,
        color_code: '',
        preview_image: null,  // ← ADD THIS
        is_active: true,
    });
    setEditingOption(null);
};

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

   const openEditModal = (option) => {
    setEditingOption(option);
    setFormData({
        category_id: option.category_id,
        name: option.name,
        description: option.description || '',
        price_modifier: option.price_modifier,
        material_id: option.material_id || '',
        quantity_used: option.quantity_used || 1,
        color_code: option.color_code || '',
        preview_image: null,  // ← ADD THIS (don't load old image, just set to null for new upload)
        is_active: option.is_active,
    });
    setModalOpen(true);
};

    const handleSubmit = () => {
        setIsSubmitting(true);

        const url = editingOption
            ? route('admin.customization-options.update', editingOption.id)
            : route('admin.customization-options.store');

        const method = editingOption ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setModalOpen(false);
                resetForm();
                showToast('success', 'Success', editingOption ? 'Option updated.' : 'Option created.');
                router.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                showToast('error', 'Error', 'Failed to save option.');
            },
        });
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };

    const getMaterialName = (materialId) => {
        const material = materials.find(m => m.id === materialId);
        return material?.name || 'None';
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
                {isSubmitting ? 'Saving...' : editingOption ? 'Update' : 'Create'}
            </button>
        </div>
    );

    // Preset colors for quick selection
    const presetColors = [
        '#FF0000', '#FFA500', '#FFFF00', '#008000', '#ADD8E6', '#00008B',
        '#800080', '#FFC0CB', '#A52A2A', '#F5F5DC', '#808080', '#4169E1',
        '#36454F', '#000000', '#FFFFFF', '#9CAF88', '#D2691E', '#CD853F'
    ];

    return (
        <AdminLayout>
            <Head title="Customization Options" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Customization Options</h1>
                            <div className="mb-4 flex justify-between items-center">
    <p className="text-sm text-stone-400">
        💡 <span className="text-amber-500">Note:</span> Customization Options are what customers see and select
        when ordering products. Link each option to a <strong className="text-amber-500">Material</strong> to automatically
        track inventory usage when customers place orders.
    </p>
</div>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                        >
                            Add New Option
                        </button>
                    </div>

                    <div className="bg-black border border-stone-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-800">
                                <thead className="bg-stone-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Option Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Color</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Material</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Usage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-800">
                                    {options.data.map((option) => (
                                        <tr key={option.id} className="hover:bg-stone-900/50">
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {getCategoryName(option.category_id)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-white">{option.name}</div>
                                                {option.description && (
                                                    <div className="text-xs text-stone-400 mt-1">{option.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-amber-500">
                                                +₱{option.price_modifier}
                                            </td>
                                            <td className="px-6 py-4">
                                                {option.color_code ? (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full border border-stone-600 shadow-sm"
                                                            style={{ backgroundColor: option.color_code }}
                                                        />
                                                        <span className="text-xs text-stone-400">{option.color_code}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-stone-500">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {getMaterialName(option.material_id)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-300">
                                                {option.quantity_used > 0 ? `${option.quantity_used} units` : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    option.is_active
                                                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                                                        : 'bg-red-900/30 text-red-400 border border-red-700'
                                                }`}>
                                                    {option.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm space-x-2">
                                                <button
                                                    onClick={() => openEditModal(option)}
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
                        {options.links && options.links.length > 0 && (
                            <div className="px-6 py-4 border-t border-stone-800">
                                <div className="flex justify-center space-x-1">
                                    {options.links.map((link, index) => (
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

           {/* Create/Edit Modal with Color Picker and Image Upload */}
<Dialog
    header={editingOption ? 'Edit Customization Option' : 'Create Customization Option'}
    visible={modalOpen}
    style={{ width: '650px' }}
    onHide={() => {
        setModalOpen(false);
        resetForm();
    }}
    footer={modalFooter}
    className="bg-black border border-stone-800 rounded-lg"
>
    <div className="space-y-4">
        {/* Category */}
        <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Category *</label>
            <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
            >
                <option value="">Select category</option>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
        </div>

        {/* Option Name */}
        <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Option Name *</label>
            <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                placeholder="e.g., Dark Walnut, Royal Blue, Leather"
            />
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Description</label>
            <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                placeholder="Brief description of this option"
            />
        </div>

        {/* Price and Color */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Price Modifier (₱)</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.price_modifier}
                    onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                    placeholder="0.00"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Color (Optional)</label>
                <div className="flex gap-2 items-center">
                    <input
                        type="color"
                        value={formData.color_code || '#000000'}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                        className="w-12 h-10 rounded border border-stone-700 bg-stone-900 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={formData.color_code}
                        onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                        placeholder="#000000"
                        className="flex-1 rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                    />
                </div>
            </div>
        </div>

        {/* Quick Color Presets */}
        <div>
            <label className="block text-sm font-medium text-stone-400 mb-2">Quick Colors</label>
            <div className="flex flex-wrap gap-2">
                {presetColors.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color_code: color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color_code === color
                                ? 'border-amber-500 scale-110'
                                : 'border-stone-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                ))}
            </div>
        </div>

        {/* ========================================== */}
        {/* PREVIEW IMAGE - ADD THIS SECTION HERE */}
        {/* ========================================== */}
        <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">
                Preview Image
            </label>
            <div className="flex items-start gap-4">
                {/* Image preview area */}
                {(editingOption?.preview_image || formData.preview_image) && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-700 bg-stone-900 flex-shrink-0">
                        <img
                            src={editingOption?.preview_image && !formData.preview_image
                                ? `/storage/${editingOption.preview_image}`
                                : URL.createObjectURL(formData.preview_image)
                            }
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className={editingOption?.preview_image || formData.preview_image ? "flex-1" : "w-full"}>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setFormData({ ...formData, preview_image: e.target.files[0] })}
                        className="w-full rounded-md bg-stone-900 border-stone-700 text-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                    />
                    <p className="text-xs text-stone-500 mt-2">
                        Upload an image showing this option (e.g., dark walnut wood sample, leather swatch, etc.)
                        <br />This image will be shown to customers when they select this option.
                    </p>
                </div>
            </div>
        </div>

        {/* Material and Quantity */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Linked Material (Raw Stock)</label>
                <select
                    value={formData.material_id}
                    onChange={(e) => setFormData({ ...formData, material_id: parseInt(e.target.value) || null })}
                    className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                >
                    <option value="">None</option>
                    {materials.map(material => (
                        <option key={material.id} value={material.id}>
                            {material.name} ({material.stock} {material.unit} in stock)
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-stone-400 mb-1">Quantity Used per Product</label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.quantity_used}
                    onChange={(e) => setFormData({ ...formData, quantity_used: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                    disabled={!formData.material_id}
                    placeholder="e.g., 0.5, 1, 2"
                />
                {formData.material_id && (
                    <p className="text-xs text-stone-500 mt-1">
                        How much material is used per product (e.g., 0.5 liters, 2 meters)
                    </p>
                )}
            </div>
        </div>

        {/* Active Status */}
        <div>
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded bg-stone-900 border-stone-700 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-stone-300">Active (visible to customers)</span>
            </label>
        </div>

        {/* Tips */}
        <div className="text-xs text-stone-500 bg-stone-900 p-3 rounded-lg">
            <span className="text-amber-500">💡 Tips:</span>
            <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Use the <strong>color picker</strong> to select colors for fabric, paint, or finish options</li>
                <li>Upload a <strong>preview image</strong> to show customers what this option looks like</li>
                <li>Link this option to a <strong>material</strong> to automatically track stock usage</li>
                <li>The <strong>quantity used</strong> tells the system how much material is needed per product</li>
                <li>Inactive options will not appear in product forms</li>
            </ul>
        </div>
    </div>
</Dialog>
        </AdminLayout>
    );
}
