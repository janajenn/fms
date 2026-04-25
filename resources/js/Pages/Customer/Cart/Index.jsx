import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import {
    Trash2,
    ShoppingBag,
    ArrowRight,
    Minus,
    Plus,
    CreditCard,
    Truck,
    ShieldCheck,
    Lock,
    RefreshCw,
    ChevronRight,
    Tag
} from 'lucide-react';

export default function Index({ cartItems, subtotal, tax, shipping, total }) {
    const { showToast } = useToast();
    const [updating, setUpdating] = useState(null);

    const updateQuantity = async (cartItem, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(cartItem.id);

    try {
        const response = await fetch(route('cart.update', cartItem.id), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'Accept': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        const data = await response.json();

        if (data.success) {
            // Update the page data with the response
            router.reload({ only: ['cartItems', 'subtotal', 'tax', 'shipping', 'total'] });
            showToast('success', 'Success', 'Cart updated!');
        } else {
            showToast('error', 'Error', data.error || 'Failed to update cart');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast('error', 'Error', 'Failed to update cart');
    } finally {
        setUpdating(null);
    }
};

const removeItem = async (cartItem) => {
    if (!confirm('Remove this item from cart?')) return;

    setUpdating(cartItem.id);

    try {
        const response = await fetch(route('cart.remove', cartItem.id), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            router.reload({ only: ['cartItems', 'subtotal', 'tax', 'shipping', 'total'] });
            showToast('success', 'Removed', 'Item removed from cart');
        } else {
            showToast('error', 'Error', data.error || 'Failed to remove item');
        }
    } catch (error) {
        console.error('Remove error:', error);
        showToast('error', 'Error', 'Failed to remove item');
    } finally {
        setUpdating(null);
    }
};

const clearCart = async () => {
    if (!confirm('Clear your entire cart?')) return;

    try {
        const response = await fetch(route('cart.clear'), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            router.reload({ only: ['cartItems', 'subtotal', 'tax', 'shipping', 'total'] });
            showToast('success', 'Cleared', 'Cart cleared successfully');
        } else {
            showToast('error', 'Error', data.error || 'Failed to clear cart');
        }
    } catch (error) {
        console.error('Clear error:', error);
        showToast('error', 'Error', 'Failed to clear cart');
    }
};



    const proceedToCheckout = () => {
        router.get(route('checkout.index'));
    };

    const formatCurrency = (value) => {
        if (!value || isNaN(value)) return '0';
        return new Intl.NumberFormat('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const renderCustomizations = (customizations) => {
        if (!customizations) return null;

        const options = [];
        Object.values(customizations).forEach(category => {
            if (category && Array.isArray(category)) {
                category.forEach(opt => {
                    if (opt && opt.name) {
                        options.push(opt.name);
                    }
                });
            }
        });

        if (options.length === 0) return null;

        return (
            <div className="flex flex-wrap gap-1 mt-1.5">
                {options.slice(0, 3).map((opt, idx) => (
                    <span key={idx} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {opt}
                    </span>
                ))}
                {options.length > 3 && (
                    <span className="text-xs text-stone-400">+{options.length - 3}</span>
                )}
            </div>
        );
    };

    // Safely check if cartItems exists and is an array
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

    return (
        <CustomerLayout>
            <Head title="Shopping Cart" />

            <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

                    {/* Header Section */}
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                                    Shopping Cart
                                </h1>
                                <p className="text-stone-500 mt-2 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    {safeCartItems.length} {safeCartItems.length === 1 ? 'item' : 'items'} in your cart
                                </p>
                            </div>
                            <Link
                                href="/products"
                                className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-all duration-200 text-sm font-medium group w-fit"
                            >
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0 transition-transform rotate-180" />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {safeCartItems.length === 0 ? (
                        // Empty State
                        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8 md:p-16 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="relative w-28 h-28 mx-auto mb-6">
                                    <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse"></div>
                                    <div className="relative w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <ShoppingBag className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-stone-800 mb-3">Your cart is empty</h2>
                                <p className="text-stone-500 mb-8">
                                    Looks like you haven't added any items yet. Start exploring our collection of premium furniture.
                                </p>
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                                >
                                    Browse Products
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cart Items Section */}
                            <div className="flex-1">
                                <div className="space-y-4">
                                    {safeCartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="p-5 md:p-6">
                                                <div className="flex gap-5">
                                                    {/* Product Image - FIXED: Added null checks */}
                                                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-stone-100 rounded-xl overflow-hidden shadow-sm">
                                                        {item.product && item.product.images && item.product.images[0] ? (
                                                            <img
                                                                src={`/storage/${item.product.images[0].image_path}`}
                                                                alt={item.product.name || 'Product'}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                                                <ShoppingBag className="w-8 h-8 text-stone-300" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-stone-800 text-base md:text-lg hover:text-amber-600 transition-colors line-clamp-1">
                                                                    {item.product?.name || 'Product not found'}
                                                                </h3>
                                                                {item.size && (
                                                                    <p className="text-sm text-stone-500 mt-1">
                                                                        Size: <span className="font-medium">{item.size.size}</span>
                                                                    </p>
                                                                )}
                                                                {renderCustomizations(item.customizations)}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-bold text-amber-600">
                                                                    ₱{formatCurrency(item.unit_price)}
                                                                </p>
                                                                {item.product && item.unit_price !== item.product.base_price && (
                                                                    <p className="text-xs text-stone-400 line-through mt-0.5">
                                                                        ₱{formatCurrency(item.product.base_price)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Quantity & Actions */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-3 border-t border-stone-100">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm text-stone-500">Quantity:</span>
                                                                <div className="flex items-center gap-2 bg-stone-100 rounded-full p-1">
                                                                    <button
                                                                        onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                        disabled={updating === item.id}
                                                                        className="w-8 h-8 rounded-full bg-white text-stone-600 hover:bg-amber-500 hover:text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-sm"
                                                                    >
                                                                        <Minus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <span className="w-10 text-center text-stone-800 font-semibold">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                        disabled={updating === item.id}
                                                                        className="w-8 h-8 rounded-full bg-white text-stone-600 hover:bg-amber-500 hover:text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center shadow-sm"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => removeItem(item)}
                                                                className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 text-sm transition-all duration-200 w-fit group"
                                                            >
                                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                                Remove
                                                            </button>
                                                        </div>

                                                        {/* Mobile Subtotal */}
                                                        <div className="block sm:hidden mt-4 pt-3 border-t border-stone-100">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-stone-500 text-sm">Subtotal</span>
                                                                <span className="font-bold text-amber-600 text-lg">
                                                                    ₱{formatCurrency(item.unit_price * item.quantity)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Clear Cart Button */}
                                    {safeCartItems.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-sm text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1.5 mt-2 group"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            Clear Cart
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary Sidebar */}
<div className="lg:w-96">
    <div className="lg:sticky lg:top-24 space-y-5">
        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-stone-100">
                <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Order Summary
                </h2>
            </div>

            <div className="p-6 space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500">Subtotal</span>
                        <span className="text-stone-800 font-semibold">
                            ₱{formatCurrency(subtotal)}
                        </span>
                    </div>

                    {/* Shipping - No longer hardcoded */}
                    <div className="flex justify-between items-center text-sm border-t border-stone-100 pt-2">
                        <span className="text-stone-500 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            Shipping
                        </span>
                        <span className="text-stone-500 italic">
                            Calculated at checkout
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500">Tax (12% VAT)</span>
                        <span className="text-stone-800">
                            ₱{formatCurrency(tax)}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-stone-200"></div>

                {/* Total - Subtotal + Tax only (shipping added at checkout) */}
                <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-stone-800">Subtotal Total</span>
                    <span className="text-2xl font-bold text-amber-600">
                        ₱{formatCurrency(subtotal + tax)}
                    </span>
                </div>

                {/* Note about final total */}
                <p className="text-xs text-stone-400 text-center">
                    Final total including shipping will be calculated at checkout
                </p>

                {/* Checkout Button */}
                <button
                    onClick={proceedToCheckout}
                    className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>

        {/* Trust & Security Features */}
        <div className="bg-white rounded-2xl shadow-md border border-stone-100 p-5">
            <h3 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Checkout
            </h3>
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SSL Encrypted Payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Easy Returns within 7 days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Best Price Guarantee</span>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-4 pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center">
                    We accept GCash, PayMaya, and Bank Transfer
                </p>
                <div className="flex justify-center gap-3 mt-3">
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded">GCash</span>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded">PayMaya</span>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded">Bank Transfer</span>
                </div>
            </div>
        </div>

        {/* Shipping Information Note */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-xs font-medium text-blue-800">Shipping Information</p>
                    <p className="text-xs text-blue-600 mt-1">
                        Delivery fee will be calculated based on your shipping address during checkout.
                        Free delivery available for Cagayan de Oro and El Salvador City areas.
                    </p>
                </div>
            </div>
        </div>

        {/* Need Help? */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 text-center">
            <p className="text-sm text-stone-700 mb-2">Need help with your order?</p>
            <Link href="/contact" className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-1">
                Contact Support
                <ChevronRight className="w-3 h-3" />
            </Link>
        </div>
    </div>
</div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
