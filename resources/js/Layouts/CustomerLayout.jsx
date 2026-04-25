import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function CustomerLayout({ children }) {
    const { auth, cartCount: initialCartCount, url } = usePage().props;
    const user = auth?.user;
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [cartCount, setCartCount] = useState(initialCartCount || 0);

    // Debug: Log the current URL to see what's being received
    useEffect(() => {
        console.log('Current URL from usePage:', url);
        console.log('Current window pathname:', window.location.pathname);
    }, [url]);

    // Check if footer should be displayed on / (home) and /products pages
    // Use window.location.pathname as fallback since it's more reliable
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : url;
    const shouldShowFooter = currentPath === '/' || currentPath === '/products';

    // Update cart count when page changes
    useEffect(() => {
        setCartCount(initialCartCount || 0);
    }, [initialCartCount]);

    const safeRoute = (routeName, params = {}) => {
        try {
            if (typeof route !== 'undefined' && route(routeName, params)) {
                return route(routeName, params);
            }
            return '#';
        } catch (e) {
            console.warn(`Route "${routeName}" not found`);
            return '#';
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Navigation Bar */}
            <nav className="bg-black/80 backdrop-blur-md border-b border-stone-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
                                    <svg className="h-8 w-8 text-amber-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-serif text-lg tracking-wide text-white group-hover:text-amber-500 transition-colors duration-300">
                                        A' Arfeels
                                    </span>
                                    <span className="text-[10px] text-stone-500 tracking-wider -mt-1">TRADING</span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/products" className="text-stone-300 hover:text-amber-500 transition duration-300 text-sm font-medium tracking-wide">
                                Products
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/cart" className="text-stone-300 hover:text-amber-500 transition duration-300 relative text-sm font-medium tracking-wide">
                                        Cart
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-3 bg-amber-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/customer/orders" className="text-stone-300 hover:text-amber-500 transition duration-300 text-sm font-medium tracking-wide">
                                        My Orders
                                    </Link>

                                    {/* User Dropdown */}
                                    <div className="relative group">
                                        <button className="flex items-center space-x-2 text-stone-300 hover:text-amber-500 transition duration-300 text-sm font-medium tracking-wide">
                                            <span>{user.name}</span>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-sm border border-stone-800 rounded-lg shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                            <Link
                                                href={safeRoute('customer.dashboard')}
                                                className="block px-4 py-2 text-sm text-stone-300 hover:bg-stone-900 hover:text-amber-500 transition-colors"
                                            >
                                                Dashboard
                                            </Link>

                                            <Link
    href="/customer/profile"
    className="block px-4 py-2 text-sm text-stone-300 hover:bg-stone-900 hover:text-amber-500 transition-colors"
>
    My Profile
</Link>


                                            <Link
                                                href={safeRoute('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full text-left px-4 py-2 text-sm text-stone-300 hover:bg-stone-900 hover:text-amber-500 transition-colors"
                                            >
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/cart" className="text-stone-300 hover:text-amber-500 transition duration-300 relative text-sm font-medium tracking-wide">
                                        Cart
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-3 bg-amber-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href={safeRoute('login')} className="text-stone-300 hover:text-amber-500 transition duration-300 text-sm font-medium tracking-wide">
                                        Login
                                    </Link>
                                    <Link href={safeRoute('register')} className="bg-amber-500 text-black px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-400 transition-all duration-300 hover:scale-105">
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center gap-3">
                            <Link href="/cart" className="relative">
                                <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="text-stone-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-stone-900 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden bg-black/95 backdrop-blur-sm border-t border-stone-800">
                        <div className="px-4 pt-3 pb-4 space-y-1">
                            <Link href="/products" className="block px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors">
                                Products
                            </Link>

                            <Link href={route('cart.index')} className="block px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors">
                                Cart
                                {cartCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-black">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <>
                                    <Link href="/customer/orders" className="block px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors">
                                        My Orders
                                    </Link>
                                    <div className="border-t border-stone-800 my-2"></div>
                                    <Link
                                        href={safeRoute('customer.dashboard')}
                                        className="block px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href={safeRoute('logout')}
                                        method="post"
                                        as="button"
                                        className="block w-full text-left px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors"
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={safeRoute('login')} className="block px-3 py-2 text-stone-300 hover:text-amber-500 rounded-lg hover:bg-stone-900 transition-colors">
                                        Login
                                    </Link>
                                    <Link href={safeRoute('register')} className="block px-3 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors text-center">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="relative">{children}</main>

            {/* Footer - ONLY displayed on home page (/) and products page (/products) */}
            {shouldShowFooter && (
                <footer className="bg-black border-t border-stone-800/50">
                    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-1">
                                <div className="flex items-center space-x-2 mb-4">
                                    <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <div>
                                        <span className="font-serif text-lg tracking-wide text-white">A' Arfeels</span>
                                        <p className="text-[10px] text-stone-500 tracking-wider -mt-1">TRADING</p>
                                    </div>
                                </div>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    Premium wood furniture crafted with precision and care. Timeless designs for modern living.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">Shop</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/products" className="text-stone-400 hover:text-amber-500 transition-colors">All Products</Link></li>
                                    <li><Link href="/products?category=dining" className="text-stone-400 hover:text-amber-500 transition-colors">Dining Tables</Link></li>
                                    <li><Link href="/products?category=chairs" className="text-stone-400 hover:text-amber-500 transition-colors">Chairs</Link></li>
                                    <li><Link href="/products?category=cabinets" className="text-stone-400 hover:text-amber-500 transition-colors">Cabinets</Link></li>
                                    <li><Link href="/products?category=beds" className="text-stone-400 hover:text-amber-500 transition-colors">Bed Frames</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">Support</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/about" className="text-stone-400 hover:text-amber-500 transition-colors">About Us</Link></li>
                                    <li><Link href="/contact" className="text-stone-400 hover:text-amber-500 transition-colors">Contact</Link></li>
                                    <li><Link href="/faq" className="text-stone-400 hover:text-amber-500 transition-colors">FAQ</Link></li>
                                    <li><Link href="/shipping" className="text-stone-400 hover:text-amber-500 transition-colors">Shipping Info</Link></li>
                                    <li><Link href="/returns" className="text-stone-400 hover:text-amber-500 transition-colors">Returns</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">Contact</h3>
                                <ul className="space-y-2 text-sm text-stone-400">
                                    <li className="flex items-start space-x-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>hello@aarfeels.com</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>+63 (123) 456-7890</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Manila, Philippines</span>
                                    </li>
                                </ul>

                                <div className="flex space-x-4 mt-6">
                                    <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="text-stone-500 hover:text-amber-500 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.968-12.09c0-.213 0-.426-.015-.637a10.025 10.025 0 002.457-2.548z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-stone-800/50 mt-10 pt-8 text-center">
                            <p className="text-sm text-stone-500">
                                &copy; {new Date().getFullYear()} A' Arfeels Trading. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
