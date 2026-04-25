import { useState, useEffect, useRef } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Head, router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import DeliveryRequestModal from '@/Components/DeliveryRequestModal';
import PaymentMethodSelector from '@/Components/PaymentMethodSelector';
import CheckoutDeliveryMap from '@/Components/CheckoutDeliveryMap';

export default function Index({ cartItems, subtotal, tax, user }) {
    const { showToast } = useToast();
    const formRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryValid, setDeliveryValid] = useState(null);
    const [deliveryFee, setDeliveryFee] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [deliveryZones, setDeliveryZones] = useState([]);

    // Down payment state
    const [downPaymentPercentage, setDownPaymentPercentage] = useState(30);
    const [downPaymentAmount, setDownPaymentAmount] = useState(0);
    const [remainingBalance, setRemainingBalance] = useState(0);

    const [formData, setFormData] = useState({
        email: user?.email || '',
        name: user?.name || '',
        address: '',
        city: '',
        barangay: '',
        postal_code: '',
        phone: '',
        notes: '',
        payment_method: 'cod',
        create_account: !user,
    });

    // Fetch delivery zones
    useEffect(() => {
        const fetchZones = async () => {
    try {
        const response = await fetch('/delivery-zones-public');
        const data = await response.json();
        console.log('Delivery zones received:', data);

        // Log each location with coordinates
        data.forEach(zone => {
            console.log(`Zone: ${zone.name}, Fee: ${zone.delivery_fee}`);
            zone.locations?.forEach(loc => {
                console.log(`  Location: ${loc.location_name}, Lat: ${loc.latitude}, Lng: ${loc.longitude}`);
            });
        });

        setDeliveryZones(data);
    } catch (error) {
        console.error('Failed to fetch delivery zones:', error);
    }
};
        fetchZones();
    }, []);

    // Safe number formatter
    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return value.toLocaleString();
    };

    // Validate delivery when city changes
    // Validate delivery when city changes
const validateDelivery = async (city, barangay) => {
    if (!city) return;

    setIsValidating(true);

    try {
        const response = await fetch(route('checkout.validate-delivery'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                'Accept': 'application/json'
            },
            body: JSON.stringify({ city, barangay })
        });

        const data = await response.json();

        if (response.ok && data.available) {
            // Location found in delivery zones
            setDeliveryValid(true);
            setDeliveryFee(data.delivery_fee);
            setShowRequestModal(false);
        } else {
            // Location not found - offer to submit request
            setDeliveryValid(false);
            setDeliveryFee(null);
            setShowRequestModal(true);

            // Don't show error toast, just silently handle
            console.log('Location not in delivery zones, showing request modal');
        }
    } catch (error) {
        console.error('Validation error:', error);
        // On any error, treat as not deliverable and show request modal
        setDeliveryValid(false);
        setDeliveryFee(null);
        setShowRequestModal(true);
    } finally {
        setIsValidating(false);
    }
};

    // Handle map location selection
   const handleMapLocationSelect = ({ city, barangay, lat, lng }) => {
    console.log('Map location selected:', { city, barangay, lat, lng });

    setFormData(prev => ({
        ...prev,
        city: city,
        barangay: barangay || '',
    }));

    // Validate delivery for the selected city
    if (city) {
        validateDelivery(city, barangay);
    }

    showToast('info', 'Location Selected', `Delivery to: ${city}`);
};




    // Watch for city changes with debounce
    useEffect(() => {
        if (formData.city) {
            const timer = setTimeout(() => {
                validateDelivery(formData.city, formData.barangay);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [formData.city, formData.barangay]);

    // Safe calculations with fallbacks
    const safeSubtotal = subtotal || 0;
    const safeTax = tax || 0;
    const currentDeliveryFee = deliveryFee !== null ? deliveryFee : 0;
    const finalTotal = safeSubtotal + safeTax + currentDeliveryFee;

    // Calculate down payment when total or payment method changes
    useEffect(() => {
        if (formData.payment_method === 'cod') {
            const downPayment = (finalTotal * downPaymentPercentage) / 100;
            setDownPaymentAmount(downPayment);
            setRemainingBalance(finalTotal - downPayment);
        } else {
            setDownPaymentAmount(finalTotal);
            setRemainingBalance(0);
        }
    }, [finalTotal, formData.payment_method, downPaymentPercentage]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!deliveryValid && formData.city) {
            setShowRequestModal(true);
            showToast('error', 'Delivery Unavailable', 'We don\'t deliver to this area yet. Please submit a delivery request.');
            return;
        }

        if (formData.payment_method === 'gcash') {
            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.action = route('checkout.store');

            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            tempForm.appendChild(csrfInput);

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = typeof value === 'object' ? JSON.stringify(value) : value;
                    tempForm.appendChild(input);
                }
            });

            if (deliveryFee !== null) {
                const deliveryFeeInput = document.createElement('input');
                deliveryFeeInput.type = 'hidden';
                deliveryFeeInput.name = 'delivery_fee';
                deliveryFeeInput.value = deliveryFee;
                tempForm.appendChild(deliveryFeeInput);
            }

            document.body.appendChild(tempForm);
            tempForm.submit();
            return;
        }

        setIsSubmitting(true);
        router.post(route('checkout.store'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                if (errors.response?.data?.errors) {
                    Object.values(errors.response.data.errors).forEach(error => {
                        showToast('error', 'Error', error[0]);
                    });
                } else {
                    showToast('error', 'Error', 'Failed to process order.');
                }
            },
        });
    };

    const handleRequestSubmitted = () => {
        showToast('success', 'Request Submitted', 'We will contact you within 24-48 hours.');
        setShowRequestModal(false);
    };

    const renderCustomizations = (customizations) => {
        if (!customizations) return null;

        const options = [];
        Object.values(customizations).forEach(category => {
            category.forEach(opt => {
                options.push(opt.name);
            });
        });

        if (options.length === 0) return null;

        return <div className="text-xs text-stone-500">{options.join(', ')}</div>;
    };

    return (
        <CustomerLayout>
            <Head title="Checkout" />

            <div className="py-12 bg-stone-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-stone-800 mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                                {/* Contact Information */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-stone-800 mb-4">Contact Information</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-stone-900 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-stone-900 bg-white"
                                            />
                                        </div>
                                        {!user && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="create_account"
                                                    checked={formData.create_account}
                                                    onChange={(e) => setFormData({ ...formData, create_account: e.target.checked })}
                                                    className="rounded text-orange-500 focus:ring-orange-500"
                                                />
                                                <label htmlFor="create_account" className="text-sm text-stone-600">
                                                    Create an account (you'll receive a password reset email)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                              {/* Shipping Address - Simplified */}
<div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold text-stone-800 mb-4">Delivery Location</h2>

    <div className="space-y-4">
        {/* Complete Address */}
        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Complete Address *</label>
            <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows="2"
                placeholder="House/Unit #, Street, Building name"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-stone-900 bg-white"
            />
        </div>

        {/* Phone Number */}
        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number *</label>
            <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-stone-900 bg-white"
            />
        </div>

        {/* Delivery Map */}
        <div className="mt-4">
            <CheckoutDeliveryMap
                zones={deliveryZones}
                selectedCity={formData.city}
                onLocationSelect={handleMapLocationSelect}
            />
        </div>

        {/* Hidden fields that get populated by map click */}
        <input type="hidden" name="city" value={formData.city} />
        <input type="hidden" name="barangay" value={formData.barangay} />
        <input type="hidden" name="postal_code" value={formData.postal_code} />

        {/* Order Notes */}
        <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Order Notes (Optional)</label>
            <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="2"
                placeholder="Special instructions or delivery notes"
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-stone-900 bg-white"
            />
        </div>
    </div>
</div>
                                {/* Payment Method */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-stone-800 mb-4">Payment Method</h2>

                                    <PaymentMethodSelector
                                        value={formData.payment_method}
                                        onChange={(method) => setFormData({ ...formData, payment_method: method })}
                                        downPaymentPercentage={downPaymentPercentage}
                                    />

                                    {formData.payment_method === 'cod' && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-800 font-medium">Cash on Delivery Terms:</p>
                                            <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                                <li>• {downPaymentPercentage}% down payment (₱{formatCurrency(downPaymentAmount)}) required upon checkout</li>
                                                <li>• Remaining balance (₱{formatCurrency(remainingBalance)}) payable upon delivery</li>
                                                <li>• Please prepare exact change for the delivery personnel</li>
                                                <li>• Orders are processed only after down payment confirmation</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>

                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                    {cartItems && cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 text-sm">
                                            <div className="w-12 h-12 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                {item.product?.images?.[0] && (
                                                    <img
                                                        src={`/storage/${item.product.images[0].image_path}`}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-stone-800">{item.product?.name}</p>
                                                {item.size && <p className="text-xs text-stone-500">Size: {item.size.size}</p>}
                                                {renderCustomizations(item.customizations)}
                                                <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-orange-500">₱{formatCurrency(item.unit_price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 text-sm border-t border-stone-200 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Subtotal</span>
                                        <span className="text-stone-800">₱{formatCurrency(safeSubtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <span className="text-stone-500">Shipping</span>
                                        <div className="text-right">
                                            {isValidating ? (
                                                <span className="text-stone-400 text-sm">Validating address...</span>
                                            ) : deliveryValid === true ? (
                                                <span className="text-stone-800 font-medium">₱{formatCurrency(currentDeliveryFee)}</span>
                                            ) : deliveryValid === false ? (
                                                <span className="text-red-500 text-sm">Delivery unavailable</span>
                                            ) : formData.city ? (
                                                <span className="text-stone-400 text-sm">Select valid address</span>
                                            ) : (
                                                <span className="text-stone-400 text-sm">Enter address to calculate</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Tax (12% VAT)</span>
                                        <span className="text-stone-800">₱{formatCurrency(safeTax)}</span>
                                    </div>

                                    {currentDeliveryFee === 0 && deliveryValid === true && (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-2">
                                            <p className="text-xs text-emerald-700 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Free delivery available for your area!
                                            </p>
                                        </div>
                                    )}

                                    {deliveryValid === false && formData.city && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                                            <p className="text-xs text-amber-700 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                We don't deliver to this area yet
                                            </p>
                                        </div>
                                    )}

                                    <div className="border-t border-stone-200 pt-3 mt-3">
                                        <div className="flex justify-between font-semibold">
                                            <span className="text-stone-800">Total Amount</span>
                                            <span className="text-orange-500">₱{formatCurrency(finalTotal)}</span>
                                        </div>
                                    </div>

                                    {formData.payment_method === 'cod' && deliveryValid === true && (
                                        <>
                                            <div className="border-t border-stone-200 mt-2 pt-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-stone-500">Down Payment ({downPaymentPercentage}%)</span>
                                                    <span className="text-emerald-600 font-semibold">₱{formatCurrency(downPaymentAmount)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-stone-500">Remaining Balance (Due upon delivery)</span>
                                                    <span className="text-stone-700">₱{formatCurrency(remainingBalance)}</span>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 rounded-lg p-2 mt-2">
                                                <p className="text-xs text-emerald-700 text-center">Pay ₱{formatCurrency(downPaymentAmount)} now to confirm your order</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isValidating || deliveryValid !== true}
                                    className="w-full mt-6 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Processing...' :
                                     isValidating ? 'Validating Address...' :
                                     deliveryValid === false ? 'Delivery Unavailable' :
                                     !formData.city ? 'Enter Address to Continue' :
                                     'Place Order'}
                                </button>

                                <p className="text-xs text-stone-400 text-center mt-4">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeliveryRequestModal
                visible={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                city={formData.city}
                barangay={formData.barangay}
                onRequestSubmitted={handleRequestSubmitted}
            />
        </CustomerLayout>
    );
}
