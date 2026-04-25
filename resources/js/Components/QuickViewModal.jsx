import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';
import { usePage, router } from '@inertiajs/react';
import LoginPromptModal from './LoginPromptModal';
import {
    ShoppingBag,
    Minus,
    Plus,
    X,
    Check,
    Shield,
    Heart,
    Truck,
    Sparkles,
    Ruler,
    Palette,
    Paintbrush,
    Sofa,
    HardDrive,
    Package
} from 'lucide-react';

export default function QuickViewModal({ product, isOpen, onClose }) {
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedCustomizations, setSelectedCustomizations] = useState({});
    const [totalPrice, setTotalPrice] = useState(product?.base_price || 0);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('details');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { showToast } = useToast();
    const { auth } = usePage().props;
    const user = auth?.user;

    const categoryIcons = {
        '1': { icon: Paintbrush, label: 'Wood Finish', color: 'amber' },
        '2': { icon: Palette, label: 'Paint Colors', color: 'purple' },
        '3': { icon: Sparkles, label: 'Finish Type', color: 'blue' },
        '4': { icon: Sofa, label: 'Fabric & Upholstery', color: 'emerald' },
        '5': { icon: Palette, label: 'Fabric Colors', color: 'rose' },
        '6': { icon: HardDrive, label: 'Knobs & Handles', color: 'stone' },
        '7': { icon: Ruler, label: 'Leg Styles', color: 'slate' },
    };

    // SINGLE useEffect for initialization - REMOVED THE DUPLICATE
    useEffect(() => {
        if (product) {
            console.log('=== PRODUCT DATA ===');
            console.log('Product customizations:', product.customizations);

            setMainImage(product.images?.[0]?.image_path ? `/storage/${product.images[0].image_path}` : null);
            setActiveImageIndex(0);
            setSelectedSize(null);
            setQuantity(1);
            setActiveTab('details');

            // Initialize customizations from product.customizations
            const initialCustomizations = {};

            if (product.customizations) {
                Object.entries(product.customizations).forEach(([categoryId, options]) => {
                    initialCustomizations[categoryId] = options.map(opt => {
                        console.log(`Option ${opt.name}:`, {
                            hasPreviewImage: !!opt.preview_image_url,
                            preview_image_url: opt.preview_image_url
                        });
                        return {
                            id: opt.id,
                            name: opt.name,
                            price_modifier: opt.price_modifier,
                            selected: opt.selected === true,
                            preview_image_url: opt.preview_image_url || null,
                        };
                    });
                });
            }

            setSelectedCustomizations(initialCustomizations);
        }
    }, [product]);

    // Price calculation
    useEffect(() => {
        if (!product) return;

        let price = parseFloat(product.base_price);

        if (selectedSize) {
            price += parseFloat(selectedSize.additional_price || 0);
        }

        Object.values(selectedCustomizations).forEach(options => {
            options.forEach(opt => {
                if (opt.selected) {
                    price += parseFloat(opt.price_modifier || 0);
                }
            });
        });

        setTotalPrice(price * quantity);
    }, [product, selectedSize, selectedCustomizations, quantity]);

        // Price calculation
    useEffect(() => {
        if (!product) return;

        let price = parseFloat(product.base_price);

        if (selectedSize) {
            price += parseFloat(selectedSize.additional_price || 0);
        }

        Object.values(selectedCustomizations).forEach(options => {
            options.forEach(opt => {
                if (opt.selected) {
                    price += parseFloat(opt.price_modifier || 0);
                }
            });
        });

        setTotalPrice(price * quantity);
    }, [product, selectedSize, selectedCustomizations, quantity]);

    // NEW: Update main image when customization is selected
    useEffect(() => {
        if (!product) return;

        // Find the first selected customization that has a preview image
        let selectedImageUrl = null;
        let selectedOptionName = null;

        Object.entries(selectedCustomizations).forEach(([categoryId, options]) => {
            for (const option of options) {
                if (option.selected && option.preview_image_url) {
                    selectedImageUrl = option.preview_image_url;
                    selectedOptionName = option.name;
                    break; // Stop searching after finding the first one
                }
            }
        });

        // If a customization image is found, update the main image
        if (selectedImageUrl) {
            console.log(`Updating main image to: ${selectedOptionName} - ${selectedImageUrl}`);
            setMainImage(selectedImageUrl);
            setActiveImageIndex(-1); // Reset active image index to indicate we're showing a customization image
        }
        // Otherwise, revert to the default product image
        else if (product.images?.[0]?.image_path) {
            setMainImage(`/storage/${product.images[0].image_path}`);
            setActiveImageIndex(0);
        }
    }, [selectedCustomizations, product]);

   const handleCustomizationToggle = (categoryId, optionId) => {
    setSelectedCustomizations(prev => {
        const category = prev[categoryId] || [];
        const existing = category.find(opt => opt.id === optionId);

        let updatedCategory;

        if (existing) {
            // If already selected, DESELECT it (unselect)
            updatedCategory = [];
        } else {
            // If selecting a new option, REPLACE all existing selections with just this one
            const option = product.customizations?.[categoryId]?.find(opt => opt.id === optionId);
            updatedCategory = [{
                ...option,
                selected: true,
                preview_image_url: option?.preview_image_url || null
            }];
        }

        return {
            ...prev,
            [categoryId]: updatedCategory
        };
    });
};



   const handleBuyNow = () => {
    if (!user) {
        setShowLoginPrompt(true);
        return;
    }

    // Prepare customizations data
    const customizationsData = {};
    Object.entries(selectedCustomizations).forEach(([categoryId, options]) => {
        if (options.length > 0) {
            customizationsData[categoryId] = options.map(opt => ({
                id: opt.id,
                name: opt.name,
                price_modifier: opt.price_modifier,
            }));
        }
    });

    // First add to cart, then go to checkout
    const requestData = {
        quantity: quantity,
        customizations: customizationsData,
    };

    if (selectedSize && selectedSize.id) {
        requestData.size_id = selectedSize.id;
    }

    router.post(route('cart.add', product.id), requestData, {
        preserveScroll: true,
        onSuccess: () => {
            // After adding to cart, redirect to checkout
            router.get(route('checkout.index'));
            onClose();
        },
        onError: (errors) => {
            console.error('Add to cart error:', errors);
            showToast('error', 'Error', 'Failed to add item to cart. Please try again.');
        },
    });
};

const handleAddToCart = () => {
    if (!user) {
        setShowLoginPrompt(true);
        return;
    }

    const customizationsData = {};
    Object.entries(selectedCustomizations).forEach(([categoryId, options]) => {
        if (options.length > 0) {
            customizationsData[categoryId] = options.map(opt => ({
                id: opt.id,
                name: opt.name,
                price_modifier: opt.price_modifier,
            }));
        }
    });

    const requestData = {
        quantity: quantity,
        customizations: customizationsData,
    };

    if (selectedSize && selectedSize.id) {
        requestData.size_id = selectedSize.id;
    }

    router.post(route('cart.add', product.id), requestData, {
        preserveScroll: true,
        onSuccess: () => {
            showToast('success', 'Added to Cart', `${product.name} has been added to your cart.`);
            onClose();
        },
        onError: (errors) => {
            console.error('Add to cart error:', errors);
            showToast('error', 'Error', 'Failed to add item to cart. Please try again.');
        },
    });
};

    if (!product) return null;

    const renderCustomizations = () => {
    if (!product.customizations) return null;

    const categories = Object.entries(product.customizations);
    if (categories.length === 0) return null;

    return (
        <div className="space-y-4">
            {categories.map(([categoryId, options]) => {
                const categoryInfo = categoryIcons[categoryId] || { icon: Package, label: 'Options' };
                const CategoryIcon = categoryInfo.icon;

                // Find the currently selected option for this category (if any)
                const selectedOption = selectedCustomizations[categoryId]?.[0];

                return (
                    <div key={categoryId} className="border border-stone-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CategoryIcon className="w-4 h-4 text-amber-500" />
                            <h4 className="text-sm font-semibold text-stone-800">
                                {categoryInfo.label}
                            </h4>
                            {selectedOption && (
                                <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    Selected: {selectedOption.name}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {options.map(option => {
                                const isSelected = selectedCustomizations[categoryId]?.some(opt => opt.id === option.id);
                                const imageUrl = option.preview_image_url || null;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleCustomizationToggle(categoryId, option.id)}
                                        className={`
                                            relative p-2 rounded-xl text-center transition-all duration-200
                                            ${isSelected
                                                ? 'ring-2 ring-amber-500 bg-amber-50'
                                                : 'border border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                                            }
                                        `}
                                    >
                                        {imageUrl ? (
                                            <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                                                <img
                                                    src={imageUrl}
                                                    alt={option.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : option.color_code ? (
                                            <div
                                                className="w-full h-20 rounded-lg mb-2 border border-stone-200"
                                                style={{ backgroundColor: option.color_code }}
                                            />
                                        ) : (
                                            <div className="w-full h-20 rounded-lg bg-stone-100 mb-2 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-stone-400" />
                                            </div>
                                        )}

                                        <p className="text-xs font-medium text-stone-700">{option.name}</p>
                                        {option.price_modifier > 0 && (
                                            <p className="text-xs text-amber-500">+₱{option.price_modifier}</p>
                                        )}

                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                                {/* Radio dot instead of checkmark for single selection */}
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-stone-400 text-center mt-3">
                            💡 Select one option per category
                        </p>
                    </div>
                );
            })}
        </div>
    );
};




    const renderSizes = () => {
        if (!product.sizes || product.sizes.length === 0) return null;

        return (
            <div className="border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                    <Ruler className="w-3.5 h-3.5 text-gray-400" />
                    <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Select Size</h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map(size => {
                        const isSelected = selectedSize?.id === size.id;
                        return (
                            <button
                                key={size.id}
                                onClick={() => setSelectedSize(size)}
                                className={`
                                    px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200
                                    ${isSelected
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {size.size}
                                {size.additional_price > 0 && (
                                    <span className={`ml-1 text-[9px] ${isSelected ? 'text-amber-100' : 'text-amber-500'}`}>
                                        +₱{size.additional_price}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getSelectedCustomizationName = () => {
    for (const options of Object.values(selectedCustomizations)) {
        for (const option of options) {
            if (option.selected && option.preview_image_url) {
                return option.name;
            }
        }
    }
    return null;
};

    const renderImages = () => {
    const images = product.images || [];
    const isShowingCustomization = activeImageIndex === -1;
    const currentCustomization = isShowingCustomization ? getSelectedCustomizationName() : null;

    return (
        <div className="space-y-3">
            <div className="relative w-full h-[420px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {isShowingCustomization && (
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                        Preview: {currentCustomization}
                    </div>
                )}
            </div>

            {/* Thumbnails - show customization thumbnails if available */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Product images thumbnails */}
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setMainImage(`/storage/${image.image_path}`);
                            setActiveImageIndex(index);
                        }}
                        className={`
                            relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200
                            ${activeImageIndex === index && !isShowingCustomization
                                ? 'ring-2 ring-amber-500 ring-offset-2'
                                : 'opacity-70 hover:opacity-100'
                            }
                        `}
                    >
                        <img
                            src={`/storage/${image.image_path}`}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}

                {/* Add customization preview thumbnails for selected options */}
                {Object.values(selectedCustomizations).flat().map(option => {
                    if (option.selected && option.preview_image_url) {
                        return (
                            <button
                                key={`custom-${option.id}`}
                                onClick={() => {
                                    setMainImage(option.preview_image_url);
                                    setActiveImageIndex(-1);
                                }}
                                className={`
                                    relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200
                                    ${activeImageIndex === -1 && mainImage === option.preview_image_url
                                        ? 'ring-2 ring-amber-500 ring-offset-2'
                                        : 'opacity-70 hover:opacity-100'
                                    }
                                `}
                            >
                                <img
                                    src={option.preview_image_url}
                                    alt={option.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] py-0.5 text-center truncate px-1">
                                    {option.name}
                                </div>
                            </button>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};




    const getSelectedCount = () => {
        let count = 0;
        Object.values(selectedCustomizations).forEach(options => {
            count += options.length;
        });
        if (selectedSize) count++;
        return count;
    };

    return (
        <>
            <Dialog
                header={null}
                visible={isOpen}
                onHide={onClose}
                style={{ width: '1100px', maxWidth: '90vw' }}
                className="quick-view-modal"
                closable={false}
            >
                <div className="bg-white rounded-2xl overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                        <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                            {renderImages()}
                        </div>

                        <div className="lg:col-span-3 p-6 flex flex-col">
                            <div className="mb-4">
                                {product.category && (
                                    <p className="text-xs text-amber-500 mb-1 font-semibold uppercase tracking-wider">
                                        {product.category.name}
                                    </p>
                                )}
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {product.name}
                                </h2>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                    {product.description || 'No description available.'}
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">₱{product.base_price.toLocaleString()}</span>
                                    {product.sizes && product.sizes.length > 0 && (
                                        <span className="text-xs text-gray-400">starting from</span>
                                    )}
                                </div>
                                {totalPrice !== parseFloat(product.base_price) && (
                                    <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 rounded-full">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <p className="text-[10px] text-amber-600 font-medium">
                                            Customized: ₱{totalPrice.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {(product.inventory?.stock > 0 || (product.sizes && product.sizes.some(s => s.stock > 0))) ? (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-emerald-600 font-medium">In Stock</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                        <span className="text-[10px] text-red-500 font-medium">Out of Stock</span>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Shield className="w-3 h-3 text-emerald-500" />
                                        <span>Premium</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Heart className="w-3 h-3 text-rose-500" />
                                        <span>Handcrafted</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Truck className="w-3 h-3 text-blue-500" />
                                        <span>Free Delivery</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-5 border-b border-gray-100 mb-4">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`pb-2 text-sm font-medium transition-colors ${
                                        activeTab === 'details'
                                            ? 'text-amber-500 border-b-2 border-amber-500'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('customize')}
                                    className={`pb-2 text-sm font-medium transition-colors relative ${
                                        activeTab === 'customize'
                                            ? 'text-amber-500 border-b-2 border-amber-500'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    Customize
                                    {getSelectedCount() > 0 && (
                                        <span className="absolute -top-2 -right-4 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] rounded-full">
                                            {getSelectedCount()}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 mb-4" style={{ maxHeight: '280px' }}>
                                {activeTab === 'details' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Key Features</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    Premium Materials
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    Handcrafted Quality
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    Customizable Options
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    5-Year Warranty
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'customize' && (
                                    <div className="space-y-3">
                                        {renderSizes()}
                                        {renderCustomizations()}
                                    </div>
                                )}
                            </div>

                            {getSelectedCount() > 0 && (
                                <div className="mb-3 p-2 bg-amber-50 rounded-lg">
                                    <p className="text-[10px] font-medium text-amber-700 mb-1">Your Selections:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(selectedCustomizations).map(([categoryId, options]) => (
                                            options.map(opt => (
                                                <span key={opt.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded-full text-[9px] text-gray-600">
                                                    {opt.name}
                                                    {opt.price_modifier > 0 && (
                                                        <span className="text-amber-500">+₱{opt.price_modifier}</span>
                                                    )}
                                                </span>
                                            ))
                                        ))}
                                        {selectedSize && (
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded-full text-[9px] text-gray-600">
                                                Size: {selectedSize.size}
                                                {selectedSize.additional_price > 0 && (
                                                    <span className="text-amber-500">+₱{selectedSize.additional_price}</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                         <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Qty:</span>
        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-0.5">
            <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-gray-800 font-medium text-sm">{quantity}</span>
            <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>

    <div className="flex gap-2">
        <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
        >
            Cancel
        </button>
        <button
            onClick={handleAddToCart}
            className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
        >
            Add to Cart
        </button>
        <button
            onClick={handleBuyNow}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
        >
            Buy Now
        </button>
    </div>
</div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <LoginPromptModal
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                productName={product?.name}
                returnUrl={window.location.pathname + window.location.search}
            />
        </>
    );
}
