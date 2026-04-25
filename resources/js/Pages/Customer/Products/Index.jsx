import React, { useState, useEffect } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link, router } from '@inertiajs/react';
import ProductCard from '@/Components/ProductCard';
import { Search, Grid3x3, List, Filter, ChevronDown, TrendingUp, Clock, DollarSign, Flame ,Truck} from 'lucide-react';

export default function Index({ products, categories = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [viewMode, setViewMode] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);

    // Handle window resize for responsive filters
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowFilters(true);
            } else {
                setShowFilters(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCategoryFilter = (categorySlug) => {
        setSelectedCategory(categorySlug);
        router.get(route('products.index', { category: categorySlug }), {}, { preserveState: true });
    };

    const handleSort = (sort) => {
        setSortBy(sort);
        router.get(route('products.index', { sort: sort }), {}, { preserveState: true });
    };

    const sortOptions = [
        { value: 'latest', label: 'Latest Arrivals', icon: Clock },
        { value: 'price_low', label: 'Price: Low to High', icon: DollarSign },
        { value: 'price_high', label: 'Price: High to Low', icon: DollarSign },
        { value: 'popular', label: 'Most Popular', icon: Flame },
        { value: 'trending', label: 'Trending', icon: TrendingUp },
    ];

    return (
        <CustomerLayout>
            <Head title="Our Collection - A' Arfeels Trading" />

            {/* Hero Section - Modern Minimalist */}
            <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-black overflow-hidden">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                {/* Gradient Orbs */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-amber-500/20">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            <span className="text-amber-400 text-sm font-medium tracking-wide">Handcrafted Excellence Since 2020</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                            Our Collection
                        </h1>
                        <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
                            Discover timeless pieces crafted from premium hardwoods,
                            designed to elevate your living space for generations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="bg-stone-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                    {/* Stats Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-stone-600">
                                Showing <span className="font-semibold text-stone-900">{products.data.length}</span> products
                            </p>
                            <p className="text-sm text-stone-500 hidden md:block">
                                {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.slug === selectedCategory)?.name}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Filters - Always visible on desktop, toggle on mobile */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filters - Desktop */}
                        <div className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="sticky top-24 space-y-5">
                                {/* Categories */}
                                <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
                                    <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-amber-500" />
                                        Categories
                                    </h3>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => handleCategoryFilter('all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                                selectedCategory === 'all'
                                                    ? 'bg-amber-50 text-amber-600 font-medium'
                                                    : 'text-stone-600 hover:bg-stone-50'
                                            }`}
                                        >
                                            All Products
                                            <span className="float-right text-stone-400 text-xs">
                                                {products.total || products.data.length}
                                            </span>
                                        </button>
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryFilter(category.slug)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                                    selectedCategory === category.slug
                                                        ? 'bg-amber-50 text-amber-600 font-medium'
                                                        : 'text-stone-600 hover:bg-stone-50'
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-5">
                                    <h3 className="font-semibold text-stone-800 mb-3">Price Range</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                        <span className="text-stone-400 self-center">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>
                                    <button className="w-full mt-3 px-3 py-1.5 text-sm bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors">
                                        Apply Filter
                                    </button>
                                </div>

                                {/* Delivery Info */}
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck className="w-4 h-4 text-amber-600" />
                                        <h4 className="font-semibold text-stone-800 text-sm">Free Delivery</h4>
                                    </div>
                                    <p className="text-xs text-stone-600">
                                        Free shipping available for Cagayan de Oro and El Salvador City areas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Filter Bar - Mobile Toggle */}
                            <div className="lg:hidden mb-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {/* Sort and View Bar */}
                            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-4 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-stone-500 hidden sm:block">Sort by:</span>
                                        <div className="relative">
                                            <select
                                                value={sortBy}
                                                onChange={(e) => handleSort(e.target.value)}
                                                className="appearance-none px-4 py-2 pr-8 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                                            >
                                                {sortOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-stone-500">View:</span>
                                        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-md transition-all ${
                                                    viewMode === 'grid'
                                                        ? 'bg-white text-amber-600 shadow-sm'
                                                        : 'text-stone-500 hover:text-stone-700'
                                                }`}
                                                title="Grid View"
                                            >
                                                <Grid3x3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 rounded-md transition-all ${
                                                    viewMode === 'list'
                                                        ? 'bg-white text-amber-600 shadow-sm'
                                                        : 'text-stone-500 hover:text-stone-700'
                                                }`}
                                                title="List View"
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products Grid/List */}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} viewMode="list" />
                                    ))}
                                </div>
                            )}

                            {/* Empty State - Enhanced */}
                            {products.data.length === 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-12 text-center">
                                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-stone-800 mb-2">No products found</h3>
                                    <p className="text-stone-500 mb-6">Try adjusting your filters or browse all categories</p>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setPriceRange({ min: '', max: '' });
                                            router.get(route('products.index'), {}, { preserveState: true });
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            )}

                            {/* Pagination - Enhanced */}
                            {products.links && products.links.length > 0 && (
                                <div className="mt-10">
                                    <div className="flex justify-center">
                                        <div className="flex gap-1.5">
                                            {products.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`
                                                        min-w-[40px] h-10 px-3 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                                                        ${link.active
                                                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                                                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                                                        }
                                                        ${!link.url && 'opacity-40 cursor-not-allowed'}
                                                    `}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
