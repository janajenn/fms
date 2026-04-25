import { useState } from 'react';
import { Dialog } from 'primereact/dialog';

export default function ProductDetailsModal({ product, isOpen, onClose }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('details');

    if (!product) return null;

    const images = product.images || [];
    const mainImage = images.length > 0 ? `/storage/${images[activeImageIndex]?.image_path}` : null;

    const statusColors = {
        pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
    };

    const getCategoryName = (categoryId) => {
        const categoryNames = {
            '1': 'Wood Finish',
            '2': 'Paint / Solid Colors',
            '3': 'Finish Type',
            '4': 'Fabric & Upholstery',
            '5': 'Fabric Colors',
            '6': 'Knobs & Handles',
            '7': 'Leg Styles',
        };
        return categoryNames[categoryId] || `Category ${categoryId}`;
    };

    const renderCustomizations = () => {
        if (!product.customizations || Object.keys(product.customizations).length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <p className="text-stone-400 text-sm">No customization options available</p>
                </div>
            );
        }

        return (
            <div className="space-y-5">
                {Object.entries(product.customizations).map(([categoryId, options]) => {
                    const selectedOptions = options.filter(opt => opt.selected);
                    if (selectedOptions.length === 0) return null;

                    return (
                        <div key={categoryId}>
                            <h4 className="text-sm font-semibold text-amber-500 mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                {getCategoryName(categoryId)}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedOptions.map(option => (
                                    <span
                                        key={option.id}
                                        className="px-3 py-1.5 bg-stone-800 rounded-lg text-xs text-stone-300 border border-stone-700 hover:border-amber-500/50 transition-colors"
                                    >
                                        {option.name}
                                        {option.price_modifier > 0 && (
                                            <span className="text-amber-500 ml-1">+₱{option.price_modifier}</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSizes = () => {
        if (!product.sizes || product.sizes.length === 0) return null;

        return (
            <div className="space-y-3">
                {product.sizes.map((size, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-stone-900/50 rounded-lg border border-stone-800 hover:border-stone-700 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-white text-sm font-medium">{size.size}</span>
                                <span className="text-stone-500 text-xs ml-1">({size.size_type})</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {size.additional_price > 0 && (
                                <span className="text-amber-500 text-sm">+₱{size.additional_price}</span>
                            )}
                            <span className="text-stone-400 text-sm">Stock: {size.stock}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const tabs = [
        { id: 'details', name: 'Details', icon: 'M4 6h16M4 12h16M4 18h16' },
        { id: 'sizes', name: 'Sizes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'customizations', name: 'Customize', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    ];

    const modalFooter = () => (
        <div className="flex justify-end">
            <button
                onClick={onClose}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-sm"
            >
                Close
            </button>
        </div>
    );

    return (
        <Dialog
            header={null}
            visible={isOpen}
            onHide={onClose}
            style={{ width: '900px', maxWidth: '90vw' }}
            className="product-details-modal"
            closable={false}
            footer={modalFooter}
        >
            <div className="flex flex-col h-full">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-stone-900 to-black px-6 py-5 border-b border-stone-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {product.category && (
                                    <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        {product.category.name}
                                    </span>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                    <span className="text-xs font-medium text-stone-400 bg-stone-800 px-2 py-0.5 rounded-full">
                                        {product.sizes.length} Sizes
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white">{product.name}</h2>
                            <p className="text-sm text-stone-400 mt-1 line-clamp-1">{product.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                    {/* Image Gallery */}
                    <div className="lg:w-1/2">
                        <div className="relative bg-stone-900 rounded-xl overflow-hidden aspect-square mb-3">
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                                            activeImageIndex === index
                                                ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-black'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={`/storage/${image.image_path}`}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="lg:w-1/2">
                        {/* Price */}
                        <div className="mb-5 pb-4 border-b border-stone-800">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-amber-500">₱{product.base_price}</span>
                                {product.sizes && product.sizes.length > 0 && (
                                    <span className="text-sm text-stone-400">starting from</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-flex w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    <span className="text-xs text-stone-400">In Stock</span>
                                </div>
                                <div className="w-px h-3 bg-stone-700"></div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-stone-400">Ready to ship</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-stone-800 mb-4">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-2 text-sm font-medium transition-all duration-200 relative ${
                                        activeTab === tab.id
                                            ? 'text-amber-500'
                                            : 'text-stone-400 hover:text-stone-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Tab Content */}
                        <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                                            Description
                                        </h4>
                                        <p className="text-sm text-stone-300 leading-relaxed">
                                            {product.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="bg-stone-900/50 rounded-lg p-3">
                                            <p className="text-xs text-stone-400 mb-1">Created</p>
                                            <p className="text-xs text-white">{new Date(product.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-stone-900/50 rounded-lg p-3">
                                            <p className="text-xs text-stone-400 mb-1">Last Updated</p>
                                            <p className="text-xs text-white">{new Date(product.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sizes' && (
                                <div>
                                    {product.sizes && product.sizes.length > 0 ? (
                                        renderSizes()
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <p className="text-stone-400 text-sm">No size variations available</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'customizations' && renderCustomizations()}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .product-details-modal :global(.p-dialog) {
                    background: #000;
                    border-radius: 1rem;
                    border: 1px solid #292524;
                    overflow: hidden;
                }

                .product-details-modal :global(.p-dialog .p-dialog-content) {
                    padding: 0;
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
