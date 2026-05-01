import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet's default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit bounds
function FitBounds({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers);
            map.fitBounds(bounds.pad(0.2));
        }
    }, [markers, map]);

    return null;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handleClick = async (e) => {
            const { lat, lng } = e.latlng;

            try {
                const loadingPopup = L.popup()
                    .setLatLng([lat, lng])
                    .setContent('<div style="padding: 8px;">Getting address details...</div>')
                    .openOn(map);

                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
                const data = await response.json();

                map.closePopup(loadingPopup);

                const city = data.address?.city || data.address?.town || data.address?.municipality || '';
                const barangay = data.address?.village || data.address?.suburb || data.address?.neighbourhood || '';
                const road = data.address?.road || '';
                const houseNumber = data.address?.house_number || '';

                let locationName = '';
                if (houseNumber && road) {
                    locationName = `${houseNumber} ${road}`;
                } else if (road) {
                    locationName = road;
                } else if (barangay) {
                    locationName = barangay;
                }

                if (city && onLocationSelect) {
                    onLocationSelect({ city, barangay, lat, lng, locationName });

                    const successPopup = L.popup()
                        .setLatLng([lat, lng])
                        .setContent(`
                            <div style="font-family: sans-serif; padding: 8px; text-align: center;">
                                <strong style="color: #10b981;">✓ Location Selected!</strong><br/>
                                <span style="font-size: 11px;">Address has been auto-filled</span>
                            </div>
                        `)
                        .openOn(map);

                    setTimeout(() => map.closePopup(successPopup), 2000);
                }
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
            }
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [map, onLocationSelect]);

    return null;
}

export default function CheckoutDeliveryMap({ zones, selectedCity, onLocationSelect }) {
    const [markerBounds, setMarkerBounds] = useState([]);

    // Process zones into markers
    const markers = [];
    zones.forEach(zone => {
        const fee = parseFloat(zone.delivery_fee);
        const color = fee === 0 ? '#10b981' : '#f59e0b';

        if (zone.locations && zone.locations.length > 0) {
            zone.locations.forEach(location => {
                if (location.latitude && location.longitude) {
                    const lat = parseFloat(location.latitude);
                    const lng = parseFloat(location.longitude);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        // FIX: Get the city from the location or use the zone name as city
                        // For barangay-level locations, the city might be the zone name or parent city
                        let city = location.city || zone.city || '';

                        // If still no city, try to use the zone name as city (if it's a city name)
                        if (!city && zone.name && !zone.name.toLowerCase().includes('zone')) {
                            city = zone.name;
                        }

                        // For barangay-type locations, we might need to derive city from the location name
                        // For example, "Luyongbonbon" is a barangay, its city might be "Opol" or "Iligan"
                        if (!city && location.location_type === 'barangay') {
                            // Try to extract city from zone name or use a default
                            city = zone.name.replace(' ZONE', '').replace('ZONE', '').trim();
                        }

                        console.log('Marker city:', city, 'for location:', location.location_name, 'type:', location.location_type);

                        markers.push({
                            id: `${zone.id}_${location.id}`,
                            lat,
                            lng,
                            name: location.location_name,
                            zoneName: zone.name,
                            fee,
                            color,
                            city: city,
                            barangay: location.barangay || location.location_name || '',
                            locationType: location.location_type || 'barangay'
                        });
                    }
                }
            });
        }
    });

    // Update bounds when markers change
    useEffect(() => {
        const bounds = markers.map(m => [m.lat, m.lng]);
        setMarkerBounds(bounds);
    }, [zones]);

    const handleMarkerClick = (marker) => {
        console.log('Marker clicked:', marker);

        // IMPORTANT: For barangay locations, we need to send both the barangay and try to derive the city
        let cityToSend = marker.city;
        let barangayToSend = marker.barangay;

        // If city is empty but this is a barangay, use the barangay as both city and barangay
        // This ensures the validation can find it either way
        if (!cityToSend && marker.locationType === 'barangay') {
            cityToSend = marker.name; // Use the location name as city
            barangayToSend = marker.name; // Also as barangay
        }

        if (onLocationSelect) {
            onLocationSelect({
                city: cityToSend,
                barangay: barangayToSend,
                lat: marker.lat,
                lng: marker.lng,
                locationName: marker.name
            });
        }
    };

    return (
        <div className="space-y-3" style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-800">Select Your Location on Map</h3>
                <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                        <span className="text-stone-600">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></div>
                        <span className="text-stone-600">Paid Delivery</span>
                    </div>
                </div>
            </div>

            <div style={{ height: '450px', width: '100%', borderRadius: '12px', position: 'relative', zIndex: 1 }}>
                <MapContainer
                    center={[8.5, 124.5]}
                    zoom={7}
                    style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                    className="rounded-xl overflow-hidden border border-stone-200 shadow-sm"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                        subdomains="abcd"
                        maxZoom={19}
                        minZoom={6}
                    />

                    <MapClickHandler onLocationSelect={onLocationSelect} />

                    {markers.map((marker) => (
                        <CircleMarker
                            key={marker.id}
                            center={[marker.lat, marker.lng]}
                            radius={8}
                            pathOptions={{
                                fillColor: marker.color,
                                color: '#ffffff',
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.9
                            }}
                            eventHandlers={{
                                mouseover: (e) => {
                                    e.target.setStyle({
                                        radius: 12,
                                        fillColor: marker.fee === 0 ? '#059669' : '#ea580c'
                                    });
                                },
                                mouseout: (e) => {
                                    e.target.setStyle({
                                        radius: 8,
                                        fillColor: marker.color
                                    });
                                },
                                click: () => {
                                    handleMarkerClick(marker);
                                }
                            }}
                        >
                            <Popup>
                                <div style={{ fontFamily: 'sans-serif', padding: '4px', minWidth: '150px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>
                                        📍 {marker.name}
                                    </div>
                                    <div style={{ color: '#666', fontSize: '10px', marginBottom: '6px' }}>
                                        Zone: {marker.zoneName}
                                    </div>
                                    <div style={{
                                        color: marker.color,
                                        fontWeight: 'bold',
                                        fontSize: '11px',
                                        textAlign: 'center'
                                    }}>
                                        {marker.fee === 0 ? '✨ FREE Delivery ✨' : `💰 Delivery Fee: ₱${marker.fee.toLocaleString()}`}
                                    </div>
                                    <button
                                        onClick={() => handleMarkerClick(marker)}
                                        style={{
                                            background: marker.color,
                                            color: 'white',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            width: '100%',
                                            marginTop: '8px'
                                        }}
                                    >
                                        Select This Location →
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}

                    <FitBounds markers={markerBounds} />
                </MapContainer>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-amber-800">
                        <p className="font-semibold mb-1">How to select your delivery location:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li><strong>Click on any colored circle</strong> (●) to select a pre-defined delivery location</li>
                            <li><strong>Click anywhere on the map</strong> to set a custom location</li>
                            <li>The address field will be automatically filled</li>
                            <li>Green = Free delivery | Orange = Paid delivery</li>
                        </ul>
                    </div>
                </div>
            </div>

            {selectedCity && (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-xs text-emerald-800">
                            <span className="font-semibold">Selected location:</span> {selectedCity}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
