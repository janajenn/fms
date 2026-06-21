import { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { useToast } from '@/Contexts/ToastContext';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue (same as in other components)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DeliveryRequestModal({ visible, onClose, city, barangay, onRequestSubmitted }) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null });

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        requested_city: '',
        requested_barangay: '',
        full_address: '',
        notes: '',
        latitude: null,
        longitude: null,
    });

    // Initialize map when modal opens
    useEffect(() => {
        if (visible && !mapRef.current && document.getElementById('delivery-request-map')) {
            // Center map on the provided city/barangay (if available), else default to Philippines
            let defaultLat = 8.5;
            let defaultLng = 124.5;
            // Attempt to geocode the provided city/barangay for better map centering (optional)
            // For simplicity, we'll use a fixed zoom level that covers typical city area.

            const mapInstance = L.map('delivery-request-map').setView([defaultLat, defaultLng], 7);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19,
            }).addTo(mapInstance);

            mapInstance.on('click', (e) => {
                const { lat, lng } = e.latlng;
                setSelectedLocation({ lat, lng });
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

                // Remove previous marker if exists
                if (markerRef.current) {
                    mapInstance.removeLayer(markerRef.current);
                }
                // Add new marker
                markerRef.current = L.marker([lat, lng]).addTo(mapInstance);
            });

            mapRef.current = mapInstance;
        }

        return () => {
            if (mapRef.current && !visible) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
                setSelectedLocation({ lat: null, lng: null });
            }
        };
    }, [visible]);

    // Pre-fill city/barangay from props when modal opens
    useEffect(() => {
        if (visible) {
            setFormData(prev => ({
                ...prev,
                requested_city: city || '',
                requested_barangay: barangay || '',
                full_address: prev.full_address || (city ? `${city}` : ''),
            }));
        }
    }, [visible, city, barangay]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.customer_name || !formData.customer_phone || !formData.requested_city || !formData.full_address) {
            showToast('error', 'Error', 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(route('delivery-request.store'), formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            if (response.data.success) {
                showToast('success', 'Request Submitted', response.data.message);
                onRequestSubmitted();
                onClose();
                setFormData({
                    customer_name: '',
                    customer_email: '',
                    customer_phone: '',
                    requested_city: '',
                    requested_barangay: '',
                    full_address: '',
                    notes: '',
                    latitude: null,
                    longitude: null,
                });
                setSelectedLocation({ lat: null, lng: null });
            }
        } catch (error) {
            console.error('Request error:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0]?.[0];
                showToast('error', 'Validation Error', firstError || 'Please check your input');
            } else {
                showToast('error', 'Error', error.response?.data?.message || 'Failed to submit request');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const footer = (
        <div className="flex justify-end gap-2">
            <button
                onClick={onClose}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
        </div>
    );

    return (
        <Dialog
            header="🚚 Delivery Unavailable in Your Area Yet"
            visible={visible}
            style={{ width: '550px' }}
            onHide={onClose}
            footer={footer}
            className="bg-black border border-stone-800 rounded-lg"
        >
            <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-amber-400 text-sm">
                        We don't currently deliver to <strong>{city || 'your area'}</strong>.
                        But we're expanding! Fill out the form below and we'll contact you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.customer_name}
                            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Contact Number *</label>
                        <input
                            type="tel"
                            required
                            value={formData.customer_phone}
                            onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">City / Municipality *</label>
                        <input
                            type="text"
                            required
                            value={formData.requested_city}
                            onChange={(e) => setFormData({ ...formData, requested_city: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Barangay / District</label>
                        <input
                            type="text"
                            value={formData.requested_barangay}
                            onChange={(e) => setFormData({ ...formData, requested_barangay: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Complete Address *</label>
                        <textarea
                            required
                            rows="2"
                            value={formData.full_address}
                            onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                            placeholder="House/Unit #, Street, Barangay, City"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>

                    {/* Map for selecting location */}
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-2">
                            Pin your exact location on the map (optional but recommended)
                        </label>
                        <div
                            id="delivery-request-map"
                            style={{ height: '240px', width: '100%', borderRadius: '8px', zIndex: 1 }}
                            className="rounded-md overflow-hidden border border-stone-700"
                        />
                        {selectedLocation.lat && selectedLocation.lng && (
                            <p className="text-xs text-stone-500 mt-2">
                                📍 Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Notes (Optional)</label>
                        <textarea
                            rows="2"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Any special instructions or details..."
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>
                </form>

                <div className="text-xs text-stone-500 border-t border-stone-800 pt-3">
                    <p>Or contact us directly:</p>
                    <p>📞 Call: [Your Number]</p>
                    <p>💬 Facebook: [Your Page]</p>
                </div>
            </div>
        </Dialog>
    );
}
