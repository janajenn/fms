import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Store, Navigation, Clock, Ruler, Package, Truck, CheckCircle } from 'lucide-react';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function OrderTrackingMap({ orderId, currentStatus }) {
    const mapRef = useRef(null);
    const currentMarkerRef = useRef(null);
    const routeLineRef = useRef(null);
    const progressLineRef = useRef(null);
    const [map, setMap] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch route data - refetches when status changes
    const fetchRoute = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            // Add timestamp to prevent browser caching
            const response = await fetch(`/api/order-route/${orderId}?_=${Date.now()}`);
            const data = await response.json();

            if (data.success && data.sender && data.receiver) {
                setRouteData(data);
            } else {
                setError(data.error || 'Failed to load route');
            }
        } catch (err) {
            console.error('Failed to fetch route:', err);
            setError('Unable to load delivery route');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when component mounts or when orderId/currentStatus changes
    useEffect(() => {
        fetchRoute();

        // Optional: Poll every 30 seconds for updates (in case status changes without page reload)
        const interval = setInterval(fetchRoute, 30000);

        return () => clearInterval(interval);
    }, [orderId, currentStatus]); // Re-fetch when status changes!

    // Initialize map and draw route
    useEffect(() => {
        if (!routeData || !routeData.sender || !routeData.receiver) {
            return;
        }

        const senderLat = parseFloat(routeData.sender.lat);
        const senderLng = parseFloat(routeData.sender.lng);
        const receiverLat = parseFloat(routeData.receiver.lat);
        const receiverLng = parseFloat(routeData.receiver.lng);
        const currentLat = routeData.current_location?.lat || senderLat;
        const currentLng = routeData.current_location?.lng || senderLng;

        if (isNaN(senderLat) || isNaN(senderLng) || isNaN(receiverLat) || isNaN(receiverLng)) {
            setError('Invalid location coordinates');
            return;
        }

        const mapContainer = document.getElementById('order-tracking-map');
        if (!mapContainer) return;

        // Clean up existing map if it exists (for updates)
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const mapInstance = L.map('order-tracking-map');

        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(mapInstance);

        // Store Icon (Green)
        const storeIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
            </div>`,
            iconSize: [36, 36],
            popupAnchor: [0, -18]
        });

        // Delivery Marker (changes based on progress)
        const getDeliveryIcon = (progress) => {
            let color = '#f59e0b';
            let icon = '🚚';

            if (progress.percentage === 0) {
                color = '#f59e0b';
                icon = '📦';
            } else if (progress.percentage === 100) {
                color = '#10b981';
                icon = '✅';
            } else if (progress.percentage >= 85) {
                color = '#06b6d4';
                icon = '📍';
            } else if (progress.percentage >= 50) {
                color = '#f59e0b';
                icon = '🚚';
            }

            return L.divIcon({
                className: 'animated-marker',
                html: `<div style="
                    background: ${color};
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.3s ease;
                ">
                    ${icon}
                </div>`,
                iconSize: [42, 42],
                popupAnchor: [0, -21]
            });
        };

        // Receiver Icon (Red)
        const receiverIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg style="width: 18px; height: 18px; color: white;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
            </div>`,
            iconSize: [36, 36],
            popupAnchor: [0, -18]
        });

        // Add markers
        L.marker([senderLat, senderLng], { icon: storeIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="text-center"><strong>🏪 Store</strong><br/>${routeData.sender.name}</div>`);

        L.marker([receiverLat, receiverLng], { icon: receiverIcon })
            .addTo(mapInstance)
            .bindPopup(`<div class="text-center"><strong>📍 Delivery Location</strong><br/>${routeData.receiver.city}</div>`);

        // Draw full route line (gray background)
        const fullRoute = [[senderLat, senderLng], [receiverLat, receiverLng]];

        L.polyline(fullRoute, {
            color: '#cbd5e1',
            weight: 4,
            opacity: 0.5,
            lineCap: 'round'
        }).addTo(mapInstance);

        // Draw progress line (colored based on percentage)
        if (routeData.delivery_progress?.percentage > 0) {
            const progressRoute = [
                [senderLat, senderLng],
                [currentLat, currentLng]
            ];

            L.polyline(progressRoute, {
                color: '#3b82f6',
                weight: 6,
                opacity: 0.9,
                lineCap: 'round'
            }).addTo(mapInstance);
        }

        // Add current location marker
        const currentIcon = getDeliveryIcon(routeData.delivery_progress || { percentage: 0 });
        const currentMarker = L.marker([currentLat, currentLng], { icon: currentIcon })
            .addTo(mapInstance)
            .bindPopup(`
                <div class="text-center">
                    <strong>${routeData.delivery_progress?.status_label || 'Order Status'}</strong><br/>
                    ${routeData.delivery_progress?.percentage}% Complete
                </div>
            `);

        currentMarkerRef.current = currentMarker;

        // Fit bounds to show entire route
        const bounds = L.latLngBounds(fullRoute);
        mapInstance.fitBounds(bounds, { padding: [50, 50] });

        // Add controls
        L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(mapInstance);
        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

        setMap(mapInstance);
        mapRef.current = mapInstance;
    }, [routeData]); // Re-run when routeData updates

    // Helper functions
    const formatDistance = (meters) => {
        if (!meters || isNaN(meters)) return 'N/A';
        if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
        return `${Math.round(meters)} m`;
    };

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return 'N/A';
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.round((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
        return `${Math.round(seconds / 60)} min`;
    };

    if (loading && !routeData) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    <p className="text-stone-600">Loading delivery status...</p>
                </div>
            </div>
        );
    }

    if (error || !routeData) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                <div className="text-center">
                    <MapPin className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                    <p className="text-stone-600">{error || 'Tracking information coming soon'}</p>
                </div>
            </div>
        );
    }

    const progress = routeData.delivery_progress || { percentage: 0, status_label: 'Order Placed' };

    return (
        <div className="space-y-4">
            {/* Progress Bar Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-amber-800">Delivery Progress</span>
                    <span className="text-sm font-bold text-amber-600">{progress.percentage}%</span>
                </div>
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
                <div className="flex justify-between mt-3 text-xs text-amber-700">
                    <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>Order Placed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>On The Way</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Delivered</span>
                    </div>
                </div>
                <p className="text-center text-sm font-medium text-amber-800 mt-3">
                    {progress.status_label}
                </p>
            </div>

            {/* Route Info Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <Store className="w-4 h-4" />
                        <span className="text-xs font-medium">From</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-800">{routeData.sender.name}</p>
                </div>

               <div className="bg-red-50 rounded-xl p-3 border border-red-200">
    <div className="flex items-center gap-2 text-red-700 mb-1">
        <MapPin className="w-4 h-4" />
        <span className="text-xs font-medium">To</span>
    </div>
    <p className="text-sm font-semibold text-red-800 truncate" title={routeData.receiver.full_address}>
        {routeData.receiver.full_address || routeData.receiver.city || 'Delivery Location'}
    </p>
</div>
            </div>

            {/* Distance & Time */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-700 mb-1">
                        <Ruler className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Distance</span>
                    </div>
                    <p className="text-lg font-bold text-blue-800">{formatDistance(routeData.route?.distance)}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center gap-1.5 text-purple-700 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Est. Time</span>
                    </div>
                    <p className="text-lg font-bold text-purple-800">{formatDuration(routeData.route?.duration)}</p>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative">
                <div
                    id="order-tracking-map"
                    style={{ height: '400px', width: '100%', borderRadius: '12px', zIndex: 1 }}
                    className="rounded-xl overflow-hidden border border-stone-200 shadow-sm"
                />
            </div>
        </div>
    );
}
