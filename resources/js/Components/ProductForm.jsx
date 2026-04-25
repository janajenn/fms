import { useState, useEffect, useRef } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import ImageManager from '@/Components/ImageManager';
import { useToast } from '@/Contexts/ToastContext';

export default function ProductForm({ product = null, categories = [], customizationCategories = [], selectedCustomizations = {} }) {
    const [sizeList, setSizeList] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize customizations with image support
    const [customizations, setCustomizations] = useState(() => {
        const initialCustomizations = {};

        // For each customization category, create an entry with all its options
        customizationCategories.forEach(cat => {
            initialCustomizations[cat.id] = cat.options.map(opt => {
                // Check if this option was selected for this product (when editing)
                const isSelected = selectedCustomizations[cat.id]?.some(s => s.id === opt.id) || false;
                const selectedOpt = selectedCustomizations[cat.id]?.find(s => s.id === opt.id);

                return {
                    id: opt.id,
                    name: opt.name,
                    price_modifier: opt.price_modifier,
                    selected: isSelected,
                    preview_image_url: selectedOpt?.preview_image_url || null,
                    new_image: null,
                };
            });
        });

        return initialCustomizations;
    });

    const imageFilesRef = useRef(imageFiles);
    useEffect(() => {
        imageFilesRef.current = imageFiles;
    }, [imageFiles]);

    const { data, setData, errors } = useForm({
        name: product?.name || '',
        description: product?.description || '',
        base_price: product?.base_price || '',
        stock: product?.inventory?.stock || 0,
        category_id: product?.category_id || '',
        images: [],
        sizes: [],
        size_unit: product?.size_unit || 'cm',
    });

    // Initialize sizes from product data
    useEffect(() => {
        if (product?.sizes && product.sizes.length > 0) {
            const initialSizes = product.sizes.map(size => ({
                id: size.id,
                size: size.size,
                size_type: size.size_type,
                additional_price: parseFloat(size.additional_price),
                stock: parseInt(size.stock),
            }));
            setSizeList(initialSizes);
            setData('sizes', initialSizes);
        }
    }, [product]);

    const addSize = () => {
        const newSize = {
            id: null,
            size: '',
            size_type: data.size_unit,
            additional_price: 0,
            stock: 0,
        };
        const updated = [...sizeList, newSize];
        setSizeList(updated);
        setData('sizes', updated);
    };

    const updateSize = (index, field, value) => {
        const updated = [...sizeList];
        updated[index][field] = value;
        setSizeList(updated);
        setData('sizes', updated);
    };

    const removeSize = (index) => {
        const updated = sizeList.filter((_, i) => i !== index);
        setSizeList(updated);
        setData('sizes', updated);
    };

    const sizeTypes = [
        { value: 'cm', label: 'Centimeters (cm)' },
        { value: 'inches', label: 'Inches (in)' },
        { value: 'mm', label: 'Millimeters (mm)' },
    ];

    const handleCustomizationToggle = (categoryId, optionId) => {
        setCustomizations(prev => {
            const category = prev[categoryId] || [];
            const updatedCategory = category.map(opt =>
                opt.id === optionId
                    ? { ...opt, selected: !opt.selected }
                    : opt
            );
            return { ...prev, [categoryId]: updatedCategory };
        });
    };

    const handleCustomizationImageChange = (categoryId, optionId, file) => {
        setCustomizations(prev => {
            const category = prev[categoryId] || [];
            const updatedCategory = category.map(opt =>
                opt.id === optionId
                    ? { ...opt, new_image: file, preview_image_url: file ? URL.createObjectURL(file) : null }
                    : opt
            );
            return { ...prev, [categoryId]: updatedCategory };
        });
    };

    const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('base_price', data.base_price);
    formData.append('stock', data.stock);
    formData.append('size_unit', data.size_unit);
    formData.append('category_id', data.category_id);

    if (product) {
        formData.append('_method', 'PUT');
    }

    // Append sizes
    const validSizes = sizeList.filter(size => size.size && size.size.trim() !== '');
    validSizes.forEach((size, index) => {
        formData.append(`sizes[${index}][size]`, size.size);
        formData.append(`sizes[${index}][size_type]`, size.size_type);
        formData.append(`sizes[${index}][additional_price]`, size.additional_price || 0);
        formData.append(`sizes[${index}][stock]`, size.stock || 0);
        if (size.id) {
            formData.append(`sizes[${index}][id]`, size.id);
        }
    });

    // Prepare customizations - include ALL options, not just selected
    const allCustomizations = {};
    Object.entries(customizations).forEach(([categoryId, options]) => {
        // Include ALL options, with their selected status
        allCustomizations[categoryId] = options.map(opt => ({
            id: opt.id,
            name: opt.name,
            price_modifier: opt.price_modifier,
            selected: opt.selected === true  // This is critical - include the selected status
        }));

        // Add images for selected options
        const selectedOptions = options.filter(opt => opt.selected === true);
        selectedOptions.forEach(opt => {
            if (opt.new_image) {
                formData.append(`customization_images[${opt.id}]`, opt.new_image);
            }
        });
    });

    // Send the customizations as a JSON string
    formData.append('customizations', JSON.stringify(allCustomizations));

    // Append main product images
    imageFilesRef.current.forEach(image => {
        formData.append('images[]', image);
    });

    setIsSubmitting(true);

    const url = product
        ? route('admin.products.update', product.id)
        : route('admin.products.store');

    router.post(url, formData, {
        preserveScroll: true,
        onSuccess: () => {
            setIsSubmitting(false);
        },
        onError: (errors) => {
            setIsSubmitting(false);
            console.error('Error:', errors);
        },
    });
};

    const tabs = [
        { id: 'basic', name: 'Basic Information', icon: 'M4 6h16M4 12h16M4 18h16' },
        { id: 'sizes', name: 'Sizes & Dimensions', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'furniture', name: 'Furniture Details', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'images', name: 'Images', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-stone-800">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-black border border-stone-800 border-b-transparent text-amber-500'
                                    : 'text-stone-400 hover:text-stone-200'
                            }`}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>



            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
                <div className="bg-black border border-stone-800 rounded-lg p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Product Name *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Category *</label>
                            <select
                                value={data.category_id}
                                onChange={e => setData('category_id', e.target.value)}
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories && categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Description</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows="6"
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Describe the product features, materials, dimensions, care instructions, etc."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Base Price (₱) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.base_price}
                                    onChange={e => setData('base_price', e.target.value)}
                                    className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                    required
                                />
                                {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-1">Initial Stock *</label>
                                <input
                                    type="number"
                                    value={data.stock}
                                    onChange={e => setData('stock', e.target.value)}
                                    className="w-full rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                    required
                                />
                                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                                <p className="text-xs text-stone-500 mt-1">Note: This stock applies only if no sizes are added</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sizes Tab */}
            {activeTab === 'sizes' && (
                <div className="bg-black border border-stone-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-medium text-white">Sizes & Dimensions</h2>
                            <p className="text-sm text-stone-400 mt-1">Add custom measurements for each size variation</p>
                        </div>
                        <button
                            type="button"
                            onClick={addSize}
                            className="px-3 py-1 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
                        >
                            + Add Size
                        </button>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-stone-400 mb-2">Default Size Unit</label>
                        <select
                            value={data.size_unit}
                            onChange={e => setData('size_unit', e.target.value)}
                            className="w-48 rounded-md bg-stone-900 border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        >
                            {sizeTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    {sizeList.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-stone-700 rounded-lg">
                            <svg className="mx-auto h-12 w-12 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-stone-400 mt-2">No sizes added yet</p>
                            <p className="text-xs text-stone-500 mt-1">Add sizes if this product has multiple size variations</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-stone-900 rounded-lg text-xs font-medium text-stone-400">
                                <div className="col-span-5">Size Description</div>
                                <div className="col-span-2">Unit</div>
                                <div className="col-span-2">Add. Price (₱)</div>
                                <div className="col-span-2">Stock</div>
                                <div className="col-span-1">Actions</div>
                            </div>
                            {sizeList.map((size, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-start bg-stone-900 p-4 rounded-lg border border-stone-800">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            placeholder="e.g., 80x60x40, Diameter 50, Length 120"
                                            value={size.size}
                                            onChange={(e) => updateSize(index, 'size', e.target.value)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <select
                                            value={size.size_type}
                                            onChange={(e) => updateSize(index, 'size_type', e.target.value)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        >
                                            {sizeTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={size.additional_price}
                                            onChange={(e) => updateSize(index, 'additional_price', parseFloat(e.target.value) || 0)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={size.stock}
                                            onChange={(e) => updateSize(index, 'stock', parseInt(e.target.value) || 0)}
                                            className="w-full rounded-md bg-black border-stone-700 text-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 p-3 bg-stone-900 rounded-lg">
                        <p className="text-xs text-stone-400">
                            <span className="text-amber-500">💡 Tip:</span> Enter dimensions like "80x60x40" for rectangular pieces,
                            "Diameter 50" for round pieces, or "Length 120" for linear measurements.
                            Each size can have its own price adjustment and stock count.
                        </p>
                    </div>
                </div>
            )}

             {/* Furniture Details Tab - FIXED */}
            {activeTab === 'furniture' && (
                <div className="space-y-6">
                    {customizationCategories.map(category => {
                        const categoryOptions = customizations[category.id] || [];

                        return (
                            <div key={category.id} className="bg-black border border-stone-800 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-white mb-4">{category.name}</h3>
                                <p className="text-sm text-stone-400 mb-4">{category.description}</p>

                                <div className="space-y-4">
                                    {category.options.map(option => {
                                        const optionData = categoryOptions.find(opt => opt.id === option.id);
                                        const isSelected = optionData?.selected || false;

                                        return (
                                            <div key={option.id} className="border border-stone-700 rounded-lg p-4 bg-stone-900/50">
                                                {/* Option Selection Row */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleCustomizationToggle(category.id, option.id)}
                                                            className="w-4 h-4 rounded border-stone-600 text-amber-500 focus:ring-amber-500"
                                                        />
                                                        <div>
                                                            <span className="text-white font-medium">{option.name}</span>
                                                            {option.price_modifier > 0 && (
                                                                <span className="text-amber-500 text-sm ml-2">+₱{option.price_modifier}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {option.material && (
                                                        <span className="text-xs text-stone-500">
                                                            Uses: {option.quantity_used} {option.material.unit}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Image Upload - Only show when option is selected */}
                                                {isSelected && (
                                                    <div className="mt-4 ml-7">
                                                        <label className="block text-sm text-stone-400 mb-2">
                                                            Preview Image for "{option.name}"
                                                        </label>
                                                        <div className="flex items-start gap-4">
                                                            {/* Image Preview */}
                                                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-stone-700 bg-stone-800 flex-shrink-0">
                                                                {optionData?.new_image ? (
                                                                    <img
                                                                        src={URL.createObjectURL(optionData.new_image)}
                                                                        alt={option.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : optionData?.preview_image_url ? (
                                                                    <img
                                                                        src={optionData.preview_image_url}
                                                                        alt={option.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <svg className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* File Input */}
                                                            <div className="flex-1">
                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/png,image/webp"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            handleCustomizationImageChange(category.id, option.id, file);
                                                                        }
                                                                    }}
                                                                    className="w-full rounded-md bg-stone-800 border-stone-700 text-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                                                                />
                                                                <p className="text-xs text-stone-500 mt-2">
                                                                    Upload an image showing this product with the {option.name} option
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
                <ImageManager
                    images={imageFiles}
                    existingImages={product?.images || []}
                    onImagesChange={setImageFiles}
                    productId={product?.id}
                />
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-stone-800">
                <Link
                    href={route('admin.products.index')}
                    className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </span>
                    ) : product ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
}
