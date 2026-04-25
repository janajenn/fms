import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function CheckoutDeliveryMap({ zones, selectedCity, onLocationSelect }) {
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (!mapRef.current && document.getElementById('checkout-delivery-map')) {
            const mapInstance = L.map('checkout-delivery-map').setView([8.5, 124.5], 7);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 6,
            }).addTo(mapInstance);

            // Add click handler
            mapInstance.on('click', async (e) => {
                const { lat, lng } = e.latlng;

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
                    const data = await response.json();
                    const city = data.address?.city || data.address?.town || data.address?.municipality || '';
                    const barangay = data.address?.village || data.address?.suburb || '';

                    console.log('Selected location:', { city, barangay, lat, lng });

                    if (city && onLocationSelect) {
                        onLocationSelect({ city, barangay, lat, lng });
                    }
                } catch (error) {
                    console.error('Reverse geocoding failed:', error);
                }
            });

            setMap(mapInstance);
            mapRef.current = mapInstance;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers when zones change
    useEffect(() => {
        if (!map) return;

        console.log('Zones received for map:', zones);

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = {};

        // Add markers for each zone's locations
        zones.forEach(zone => {
            // Replace with this:
const fee = parseFloat(zone.delivery_fee);
const color = fee === 0 ? '#10b981' : '#f59e0b';

            if (!zone.locations || zone.locations.length === 0) {
                console.log(`Zone ${zone.name} has no locations with coordinates`);
                return;
            }

            zone.locations.forEach(location => {
                if (location.latitude && location.longitude) {
                    const lat = parseFloat(location.latitude);
                    const lng = parseFloat(location.longitude);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        console.log(`Adding marker for ${location.location_name} at ${lat}, ${lng}`);

                        const marker = L.marker([lat, lng], {
                            icon: L.divIcon({
                                className: 'custom-marker',
                                html: `<div style="
                                    background-color: ${color};
                                    width: 14px;
                                    height: 14px;
                                    border-radius: 50%;
                                    border: 2px solid white;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                                    cursor: pointer;
                                "></div>`,
                                iconSize: [14, 14],
                                popupAnchor: [0, -7]
                            })
                        }).addTo(map);

                        marker.bindPopup(`
                            <div style="font-family: sans-serif; min-width: 150px; padding: 4px;">
                                <strong>${location.location_name}</strong><br/>
                                <span style="color: #6b7280; font-size: 11px;">Zone: ${zone.name}</span><br/>
                                <span style="color: ${color}; font-size: 12px; font-weight: bold;">
                                   ${fee === 0 ? 'FREE Delivery' : `₱${fee.toLocaleString()}`}
                                </span>
                            </div>
                        `);

                        markersRef.current[`${zone.id}_${location.id}`] = marker;
                    }
                }
            });
        });
    }, [zones, map]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-800">Select Your Location on Map</h3>
                <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-white/20"></div>
                        <span className="text-stone-600">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-500 ring-1 ring-white/20"></div>
                        <span className="text-stone-600">Paid Delivery</span>
                    </div>
                </div>
            </div>

            <div
                id="checkout-delivery-map"
                style={{ height: '450px', width: '100%', borderRadius: '12px', zIndex: 1 }}
                className="rounded-xl overflow-hidden border border-stone-200 shadow-sm"
            />

            <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Click anywhere on the map to set your delivery location. If your area is not marked, we'll review your request.
                </p>
            </div>

            {/* Selected Location Display */}
            {selectedCity && (
                <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs text-emerald-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Selected location: <strong>{selectedCity}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}
