import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    ShoppingBag,
    Truck,
    Shield,
    Star,
    ArrowRight,
    ChevronRight,
    Phone,
    Mail,
    MapPin,
    Award,
    Clock,
    Leaf,
    HeartHandshake,
    CheckCircle,
    XCircle,
    Loader
} from 'lucide-react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [scrolled, setScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

    // Delivery checker states
    const [checkLocation, setCheckLocation] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [deliveryResult, setDeliveryResult] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % 3);
        }, 5000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    // Check delivery availability
    // Check delivery availability
const checkDeliveryAvailability = async () => {
    if (!checkLocation.trim()) {
        setDeliveryResult({
            available: false,
            message: 'Please enter a location to check'
        });
        setShowResult(true);
        setTimeout(() => setShowResult(false), 3000);
        return;
    }

    setIsChecking(true);
    setShowResult(false);

    try {
        // Try to determine if input is a city or barangay
        const location = checkLocation.trim();

        // Send as city first, also include as barangay if it might be one
        const response = await fetch(route('checkout.validate-delivery'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                city: location,
                barangay: location // Send same value as both city and barangay
            })
        });

        const data = await response.json();

        if (response.ok && data.available) {
            let feeMessage = '';
            if (data.delivery_fee === 0) {
                feeMessage = '✓ Great news! We deliver to your area with FREE delivery!';
            } else {
                feeMessage = `✓ We deliver to your area! Delivery fee: ₱${data.delivery_fee.toLocaleString()}`;
            }

            setDeliveryResult({
                available: true,
                fee: data.delivery_fee,
                matched_on: data.matched_on,
                matched_location: data.matched_location,
                message: feeMessage
            });
        } else {
            setDeliveryResult({
                available: false,
                message: `We currently do not deliver to "${checkLocation}" yet. Please submit a delivery request and we'll review it.`
            });
        }
    } catch (error) {
        console.error('Delivery check error:', error);
        setDeliveryResult({
            available: false,
            message: 'Unable to check delivery. Please try again or contact us directly.'
        });
    } finally {
        setIsChecking(false);
        setShowResult(true);
        setTimeout(() => setShowResult(false), 5000);
    }
};





    const featuredProducts = [
        { id: 1, name: 'Product name', price: 25000, rating: 4.8, image: '../images/products/product_image_placeholder.png' },
        { id: 2, name: 'Product name', price: 12500, rating: 4.9, image: '../images/products/product_image_placeholder.png' },
        { id: 3, name: 'Product name', price: 18500, rating: 4.7, image: '../images/products/product_image_placeholder.png' },
        { id: 4, name: 'Product name', price: 22000, rating: 4.8, image: '../images/products/product_image_placeholder.png' },
    ];

    const categories = [
        { name: 'Dining Tables', icon: '', link: '/products?category=dining' },
        { name: 'Sofas & Armchairs', icon: '', link: '/products?category=sofas' },
        { name: 'Cabinets & Storage', icon: '', link: '/products?category=cabinets' },
        { name: 'Bed Frames', icon: '', link: '/products?category=beds' },
    ];

    const testimonials = [
        {
            name: 'Maria Santos',
            location: 'Cagayan de Oro',
            rating: 5,
            text: "The quality of their furniture is exceptional! Our dining table is stunning and built to last. Customer service was also very helpful.",
            image: '../images/products/product_image_placeholder.png'
        },
        {
            name: 'John Dela Cruz',
            location: 'El Salvador City',
            rating: 5,
            text: "Best furniture investment we've made. The craftsmanship is outstanding and the delivery was prompt. Highly recommended!",
            image: '../images/products/product_image_placeholder.png'
        },
        {
            name: 'Anna Reyes',
            location: 'Iligan City',
            rating: 5,
            text: "Love my new cabinet! The customization options were perfect and the team was very professional. Will definitely order again.",
            image: '../images/products/product_image_placeholder.png'
        }
    ];

    return (
        <CustomerLayout>
            <Head title="A' Arfeels Trading - Premium Handcrafted Furniture" />

            {/* Hero Section - Premium Furniture Showcase */}
            <div className="relative min-h-screen flex items-center bg-black overflow-hidden">
                {/* Background with subtle pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-black to-stone-950"></div>
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>

                {/* Floating decorative orbs */}
                <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 md:py-0">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-amber-500/20">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                <span className="text-amber-400 text-sm font-medium tracking-wide">Handcrafted Excellence Since 2020</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                                Premium Furniture
                                <span className="text-amber-500 block mt-2">Crafted for Modern Living</span>
                            </h1>

                            <p className="text-lg text-stone-300 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                                Discover timeless pieces meticulously handcrafted from premium hardwoods,
                                designed to elevate your living space for generations to come.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                                <Link
                                    href="/products"
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Shop Now
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/products?customizable=true"
                                    className="inline-flex items-center justify-center px-8 py-3.5 border border-stone-700 text-stone-300 rounded-full font-medium hover:bg-stone-800 hover:border-amber-500 transition-all duration-300"
                                >
                                    Customize Order
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                {[
                                    { icon: Truck, text: 'Free Delivery in Selected Areas' },
                                    { icon: Leaf, text: 'Quality Wood Materials' },
                                    { icon: HeartHandshake, text: 'Cash on Delivery' },
                                    { icon: Award, text: 'Custom Furniture Available' }
                                ].map((badge, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-stone-400 text-xs">
                                        <badge.icon className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{badge.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Furniture Showcase */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="../images/furniture_hero/hero2.png"
                                    alt="Premium Furniture Collection"
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                                {/* Floating badge */}
                                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2">
                                    <p className="text-xs text-amber-500 font-semibold">NEW COLLECTION</p>
                                </div>
                            </div>

                            {/* Stats floating cards */}
                            <div className="absolute -bottom-6 -left-6 bg-stone-900 rounded-xl p-4 shadow-xl border border-stone-800">
                                <p className="text-2xl font-bold text-white">500+</p>
                                <p className="text-xs text-stone-400">Happy Customers</p>
                            </div>
                            <div className="absolute -top-6 -right-6 bg-stone-900 rounded-xl p-4 shadow-xl border border-stone-800">
                                <p className="text-2xl font-bold text-white">5+</p>
                                <p className="text-xs text-stone-400">Years of Excellence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="py-20 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Best Sellers</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-2 mb-4">Featured Products</h2>
                        <p className="text-stone-500 max-w-2xl mx-auto">Our most loved pieces, crafted with exceptional quality and timeless design</p>
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="relative h-64 overflow-hidden bg-stone-100">
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-10"></div>
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <button className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-stone-800 px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-amber-500 hover:text-white">
                                        Quick View
                                    </button>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-stone-800 mb-1">{product.name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-stone-500">({product.rating})</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-amber-600">₱{product.price.toLocaleString()}</span>
                                        <button className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-sm hover:bg-amber-500 hover:text-white transition-colors">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link href="/products" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold group">
                            View All Products
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Shop by Category</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-2 mb-4">Browse Our Collections</h2>
                        <p className="text-stone-500 max-w-2xl mx-auto">Find the perfect piece for every room in your home</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, idx) => (
                            <Link key={idx} href={category.link} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="text-5xl mb-4">{category.icon}</div>
                                <h3 className="text-white font-semibold text-lg mb-1">{category.name}</h3>
                                <p className="text-stone-400 text-sm">{category.count} designs available</p>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="py-20 bg-stone-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-amber-500 text-sm font-semibold uppercase tracking-wider">Why Choose Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">Crafted with Passion, Built to Last</h2>
                        <p className="text-stone-400 max-w-2xl mx-auto">Experience the difference of truly handcrafted furniture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Award, title: 'Premium Materials', description: 'Only the finest hardwoods and materials selected for durability and beauty' },
                            { icon: HeartHandshake, title: 'Skilled Craftsmanship', description: 'Each piece handcrafted by master artisans with decades of experience' },
                            { icon: Truck, title: 'Fast Delivery', description: 'Free delivery within Cagayan de Oro and El Salvador City' },
                            { icon: Shield, title: 'Trusted Service', description: '5-year warranty and dedicated customer support' }
                        ].map((feature, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-500/20 transition-colors">
                                    <feature.icon className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                                <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customer Testimonials */}
            <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mt-2 mb-4">What Our Customers Say</h2>
                        <p className="text-stone-500 max-w-2xl mx-auto">Join thousands of satisfied customers who trust A' Arfeels Trading</p>
                    </div>

                    <div className="relative">
                        <div className="overflow-hidden">
                            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                                {testimonials.map((testimonial, idx) => (
                                    <div key={idx} className="w-full flex-shrink-0 px-4">
                                        <div className="bg-stone-50 rounded-2xl p-8 max-w-2xl mx-auto">
                                            <div className="flex items-center gap-2 mb-4">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                                                ))}
                                            </div>
                                            <p className="text-stone-600 text-lg leading-relaxed mb-6">"{testimonial.text}"</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center">
                                                    <span className="text-stone-500 text-lg font-semibold">{testimonial.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-stone-800">{testimonial.name}</p>
                                                    <p className="text-sm text-stone-500">{testimonial.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {testimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTestimonial(idx)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-6 bg-amber-500' : 'bg-stone-300'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Coverage CTA - Enhanced with Result Display */}
            <div className="py-20 bg-gradient-to-r from-amber-600 to-orange-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Check Your Delivery Coverage</h2>
                    <p className="text-amber-100 text-lg mb-8 max-w-2xl mx-auto">
                        We deliver to Cagayan de Oro and El Salvador City with FREE delivery.
                        Enter your location to see if we deliver to your area.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                value={checkLocation}
                                onChange={(e) => setCheckLocation(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && checkDeliveryAvailability()}
                                placeholder="Enter your city or barangay"
                                className="w-full pl-12 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-white text-stone-800 placeholder:text-stone-400"
                            />
                        </div>
                        <button
                            onClick={checkDeliveryAvailability}
                            disabled={isChecking}
                            className="px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isChecking ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                'Check Eligibility'
                            )}
                        </button>
                    </div>
                    <p className="text-amber-100 text-sm mt-4">📍 Free delivery for Cagayan de Oro and El Salvador City areas</p>

                    {/* Result Toast/Notification */}
                    {/* Result Toast/Notification */}
{showResult && deliveryResult && (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-in-right`}>
        <div className={`rounded-xl shadow-xl p-4 ${
            deliveryResult.available
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
        }`}>
            <div className="flex items-start gap-3">
                {deliveryResult.available ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                    <p className="font-semibold text-sm">
                        {deliveryResult.available ? 'Delivery Available!' : 'Delivery Unavailable'}
                    </p>
                    <p className="text-sm opacity-90 mt-0.5">{deliveryResult.message}</p>
                    {deliveryResult.available && deliveryResult.fee === 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">
                            <Truck className="w-3 h-3" />
                            FREE DELIVERY
                        </div>
                    )}
                    {deliveryResult.available && deliveryResult.matched_location && (
                        <p className="text-xs opacity-75 mt-1">
                            Matched with: {deliveryResult.matched_location}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowResult(false)}
                    className="text-white/70 hover:text-white"
                >
                    ×
                </button>
            </div>
            {!deliveryResult.available && (
                <div className="mt-3 pt-2 border-t border-white/20">
                    <Link
                        href="/contact"
                        className="text-xs flex items-center gap-1 hover:underline"
                    >
                        Contact us for delivery inquiry
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    </div>
)}
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </CustomerLayout>
    );
}
