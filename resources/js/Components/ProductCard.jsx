import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import QuickViewModal from './QuickViewModal';


export default function ProductCard({ product, viewMode = 'grid' }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    const imageUrl = product.first_image_url || (product.images && product.images[0] ? `/storage/${product.images[0].image_path}` : null);
    const isInStock = product.inventory?.stock > 0 || (product.sizes && product.sizes.some(s => s.stock > 0));


    // Add this right before the return statement
console.log('ProductCard - product.customizations:', product.customizations);
console.log('ProductCard - product:', product);
    if (viewMode === 'list') {
        return (
            <>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-stone-100">
                    <Link href={`/products/${product.id}`} className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-48 bg-stone-100 relative overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-stone-800 hover:text-amber-600 transition-colors">
                                    {product.name}
                                </h3>
                                {product.category && (
                                    <p className="text-sm text-stone-500 mt-1">{product.category.name}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-amber-600">₱{product.base_price}</p>
                                {product.sizes && product.sizes.length > 0 && (
                                    <p className="text-xs text-stone-400 mt-1">{product.sizes.length} sizes available</p>
                                )}
                            </div>
                        </div>
                        {product.description && (
                            <p className="text-stone-600 mt-3 line-clamp-2">{product.description}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isInStock ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                )}
                                {product.sizes && product.sizes.length > 0 && (
                                    <span className="text-xs text-stone-400">
                                        {product.sizes.reduce((sum, s) => sum + s.stock, 0)} units available
                                    </span>
                                )}
                            </div>
                            <Link
                                href={`/products/${product.id}`}
                                className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
                            >
                                View Details
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </Link>
            </div>
            <QuickViewModal
                    product={product}
                    isOpen={quickViewOpen}
                    onClose={() => setQuickViewOpen(false)}
                />
            </>
        );
    }

    // Grid mode - Modern Card Design
    return (
        <>
            <div
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative aspect-square bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setQuickViewOpen(true)}>
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-all duration-500 ${
                                isHovered ? 'scale-105' : 'scale-100'
                            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100">
                            <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_new && (
                            <span className="px-2 py-1 text-xs font-semibold bg-amber-500 text-white rounded">
                                New
                            </span>
                        )}
                    </div>

                    {/* Quick View Overlay */}
                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setQuickViewOpen(true);
                            }}
                            className="px-5 py-2.5 bg-white text-stone-800 rounded-lg font-medium hover:bg-amber-500 hover:text-white transition-all transform hover:scale-105"
                        >
                            Quick View
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Category */}
                    {product.category && (
                        <p className="text-xs text-amber-600 uppercase tracking-wider mb-2">
                            {product.category.name}
                        </p>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Description */}
                    {product.description && (
                        <p className="text-stone-500 text-sm mt-2 line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    {/* Price and Stock */}
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-amber-600">
                                ₱{product.base_price}
                            </p>
                            {product.sizes && product.sizes.length > 0 && (
                                <p className="text-xs text-stone-400 mt-1">
                                    {product.sizes.length} sizes available
                                </p>
                            )}
                        </div>
                        {isInStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                In Stock
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                        <Link
                            href={`/products/${product.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-all duration-300"
                        >
                            <span>View Details</span>
                        </Link>
                        <button
                            onClick={() => setQuickViewOpen(true)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <QuickViewModal
                product={product}
                isOpen={quickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        </>
    );
}
