import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { router, Link } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import axios from 'axios';

export default function MaterialFormModal({ isOpen, onClose, material = null, suppliers = [] }) {
    const { showToast } = useToast();
    const isEditing = !!material;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({
        name: '',
        unit: '',
        stock: 0,
        minimum_stock: 5,
        supplier_id: '',
        cost_per_unit: '',
        description: '',
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    const units = [
        { value: 'pieces', label: 'Pieces', icon: '📦' },
        { value: 'meters', label: 'Meters', icon: '📏' },
        { value: 'liters', label: 'Liters', icon: '🧴' },
        { value: 'kilograms', label: 'Kilograms', icon: '⚖️' },
        { value: 'grams', label: 'Grams', icon: '⚖️' },
        { value: 'sets', label: 'Sets', icon: '🎯' },
        { value: 'boxes', label: 'Boxes', icon: '📦' }
    ];

    useEffect(() => {
        if (material) {
            setFormData({
                name: material.name,
                unit: material.unit,
                stock: material.stock,
                minimum_stock: material.minimum_stock,
                supplier_id: material.supplier_id || '',
                cost_per_unit: material.cost_per_unit || '',
                description: material.description || '',
                is_active: material.is_active,
            });
        } else {
            resetForm();
        }
    }, [material]);

    const resetForm = () => {
        setFormData({
            name: '',
            unit: '',
            stock: 0,
            minimum_stock: 5,
            supplier_id: '',
            cost_per_unit: '',
            description: '',
            is_active: true,
        });
        setErrors({});
        setActiveTab('basic');
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        const url = isEditing
            ? route('admin.materials.update', material.id)
            : route('admin.materials.store');

        const method = isEditing ? 'put' : 'post';

        router[method](url, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                resetForm();
                showToast('success', 'Success', isEditing ? 'Material updated successfully.' : 'Material created successfully.');
                onClose();
                router.reload();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.response?.data?.errors) {
                    setErrors(errors.response.data.errors);
                } else {
                    showToast('error', 'Error', 'Failed to save material.');
                }
            },
        });
    };

    const getSelectedUnitIcon = () => {
        const unit = units.find(u => u.value === formData.unit);
        return unit?.icon || '📦';
    };

    const modalFooter = () => (
        <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
            <button
                onClick={() => {
                    resetForm();
                    onClose();
                }}
                className="px-5 py-2.5 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white transition-all duration-200 text-sm font-medium"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : (
                    <>
                        {isEditing ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Update Material
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Material
                            </>
                        )}
                    </>
                )}
            </button>
        </div>
    );

    const tabs = [
        { id: 'basic', name: 'Basic Info', icon: 'M4 6h16M4 12h16M4 18h16' },
        { id: 'inventory', name: 'Inventory', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { id: 'supplier', name: 'Supplier', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    return (
        <Dialog
            header={null}
            visible={isOpen}
            onHide={() => {
                resetForm();
                onClose();
            }}
            style={{ width: '680px', maxWidth: '90vw' }}
            className="material-form-modal"
            closable={false}
        >
            <div className="flex flex-col h-full">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-stone-900 to-black px-6 py-5 border-b border-stone-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {isEditing ? 'Edit Material' : 'Add New Material'}
                            </h2>
                            <p className="text-sm text-stone-400 mt-1">
                                {isEditing ? 'Update material details and inventory information' : 'Add a new raw material to your inventory'}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="text-stone-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 pt-4 border-b border-stone-800">
                    <div className="flex gap-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium transition-all duration-200 relative ${
                                    activeTab === tab.id
                                        ? 'text-amber-500'
                                        : 'text-stone-400 hover:text-stone-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                    </svg>
                                    {tab.name}
                                </div>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Content - Fixed Height */}
                <div className="p-6 h-[420px] overflow-y-auto custom-scrollbar">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Material Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g., Leather, Dark Walnut Stain, Gold Knobs"
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                                    placeholder="Describe the material, its properties, and typical uses..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        Unit of Measurement <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-stone-500 text-lg">{getSelectedUnitIcon()}</span>
                                        </div>
                                        <select
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                                        >
                                            <option value="">Select unit</option>
                                            {units.map(unit => (
                                                <option key={unit.value} value={unit.value}>
                                                    {unit.icon} {unit.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        Initial Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        Minimum Stock Alert
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.minimum_stock}
                                        onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="5"
                                    />
                                    <p className="text-xs text-stone-500 mt-1">Alert when stock falls below this level</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        Cost per Unit (₱)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_per_unit}
                                        onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || '' })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded bg-stone-900 border-stone-700 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                                        />
                                        <span className="text-sm text-stone-300">Active</span>
                                    </label>
                                    <p className="text-xs text-stone-500 mt-1 ml-7">Inactive materials won't appear in customization options</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Supplier Tab */}
                    {activeTab === 'supplier' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Select Supplier
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-900 border border-stone-700 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                                    >
                                        <option value="">Select supplier</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {!suppliers.length && (
                                    <div className="mt-3 p-3 bg-stone-900/50 rounded-lg border border-stone-800">
                                        <p className="text-sm text-stone-400">
                                            No suppliers found.
                                            <Link href={route('admin.suppliers.index')} className="text-amber-500 hover:text-amber-400 ml-1">
                                                Add a supplier first
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {modalFooter()}
            </div>

            <style jsx>{`
                .material-form-modal :global(.p-dialog) {
                    background: #000;
                    border-radius: 1rem;
                    border: 1px solid #292524;
                    overflow: hidden;
                }

                .material-form-modal :global(.p-dialog .p-dialog-content) {
                    padding: 0;
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1c1917;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #44403c;
                    border-radius: 10px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #57534e;
                }
            `}</style>
        </Dialog>
    );
}
