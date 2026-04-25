import { useState } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, router,Link } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Home,
    Building2,
    Shield,
    Lock,
    Eye,
    EyeOff,
    Save,
    CreditCard,
    Package,
    LogOut,
    ChevronRight,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function Index({ user }) {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        barangay: user?.barangay || '',
        postal_code: user?.postal_code || '',
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [errors, setErrors] = useState({});

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(route('customer.profile.update'), profileForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                showToast('success', 'Updated', 'Profile updated successfully');
                setErrors({});
            },
            onError: (err) => {
                setIsSubmitting(false);
                setErrors(err);
                showToast('error', 'Error', 'Failed to update profile');
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            showToast('error', 'Error', 'Passwords do not match');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            showToast('error', 'Error', 'Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);

        router.put(route('customer.profile.password'), passwordForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setPasswordForm({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
                showToast('success', 'Updated', 'Password updated successfully');
                setErrors({});
            },
            onError: (err) => {
                setIsSubmitting(false);
                setErrors(err);
                showToast('error', 'Error', err?.current_password || 'Failed to update password');
            },
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profile Information', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'address', label: 'Address', icon: MapPin },
    ];

    return (
        <CustomerLayout>
            <Head title="My Profile" />

            <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">

                    {/* Header */}
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                                    My Profile
                                </h1>
                                <p className="text-stone-500 mt-2">
                                    Manage your account information and preferences
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/customer/orders"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-amber-600 transition-colors text-sm font-medium"
                                >
                                    <Package className="w-4 h-4" />
                                    My Orders
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 transition-colors text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-80">
                            <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden sticky top-24">
                                {/* User Info Card */}
                                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-center">
                                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-white font-semibold text-lg">{user?.name}</h3>
                                    <p className="text-amber-100 text-sm mt-1">{user?.email}</p>
                                    {user?.phone && (
                                        <p className="text-amber-100 text-xs mt-2 flex items-center justify-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {user.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Navigation Tabs */}
                                <div className="p-4 space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                                    ${activeTab === tab.id
                                                        ? 'bg-amber-50 text-amber-600 font-medium'
                                                        : 'text-stone-600 hover:bg-stone-50'
                                                    }
                                                `}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="flex-1 text-left">{tab.label}</span>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-1' : ''}`} />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Member Since */}
                                <div className="border-t border-stone-100 p-4">
                                    <p className="text-xs text-stone-400 text-center">
                                        Member since {new Date(user?.created_at).toLocaleDateString('en-PH', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Profile Information Tab */}
                            {activeTab === 'profile' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                            <User className="w-5 h-5 text-amber-500" />
                                            Profile Information
                                        </h2>
                                        <p className="text-sm text-stone-500 mt-1">
                                            Update your personal information
                                        </p>
                                    </div>

                                    <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                        required
                                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                    <input
                                                        type="email"
                                                        value={profileForm.email}
                                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                        required
                                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                    <input
                                                        type="tel"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        placeholder="0912 345 6789"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-amber-500" />
                                            Security Settings
                                        </h2>
                                        <p className="text-sm text-stone-500 mt-1">
                                            Change your password
                                        </p>
                                    </div>

                                    <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                Current Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={passwordForm.current_password}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-12 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.current_password && (
                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.current_password}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                New Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={passwordForm.new_password}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-12 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-stone-400 mt-1">Minimum 8 characters</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                Confirm New Password *
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={passwordForm.new_password_confirmation}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                                                    required
                                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-800">Password Tips</p>
                                                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                                                        <li>• Use at least 8 characters</li>
                                                        <li>• Mix uppercase and lowercase letters</li>
                                                        <li>• Include numbers and special characters</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSubmitting ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Address Tab */}
                            {activeTab === 'address' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                                        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-amber-500" />
                                            Shipping Address
                                        </h2>
                                        <p className="text-sm text-stone-500 mt-1">
                                            Update your default shipping address
                                        </p>
                                    </div>

                                    <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                Street Address
                                            </label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                <input
                                                    type="text"
                                                    value={profileForm.address}
                                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                                    placeholder="House/Unit #, Street"
                                                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    Barangay/District
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileForm.barangay}
                                                    onChange={(e) => setProfileForm({ ...profileForm, barangay: e.target.value })}
                                                    placeholder="Barangay or district"
                                                    className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    City/Municipality
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.city}
                                                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                                                        placeholder="City or municipality"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">
                                                Postal Code
                                            </label>
                                            <input
                                                type="text"
                                                value={profileForm.postal_code}
                                                onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                                                placeholder="Postal code"
                                                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                                            />
                                        </div>

                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-800">Delivery Information</p>
                                                    <p className="text-xs text-blue-700 mt-1">
                                                        Free delivery for Cagayan de Oro and El Salvador City areas.
                                                        Delivery fee applies for other locations.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                {isSubmitting ? 'Saving...' : 'Save Address'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
