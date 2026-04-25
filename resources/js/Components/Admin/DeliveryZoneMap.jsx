import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function DeliveryZoneMap({ zones, onLocationSelect, selectedZoneId }) {
    const mapRef = useRef(null);
    const markersRef = useRef({});
    const [map, setMap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search for locations
    const searchLocation = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph&limit=5`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Select a search result
    const selectLocation = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        map.setView([lat, lng], 14);

        onLocationSelect({
            name: result.display_name.split(',')[0],
            lat: lat,
            lng: lng,
            place_id: result.place_id
        });

        setSearchResults([]);
        setSearchQuery('');
    };

    useEffect(() => {
        if (!mapRef.current && document.getElementById('delivery-map')) {
            // Initialize map centered on Mindanao with better styling
            const mapInstance = L.map('delivery-map').setView([8.5, 124.5], 8);

            // Use a nicer tile layer - OpenStreetMap with clean styling (green land, blue water)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                minZoom: 6,
            }).addTo(mapInstance);

            // Add scale control
            L.control.scale({
                metric: true,
                imperial: false,
                position: 'bottomleft'
            }).addTo(mapInstance);

            // Add zoom control to bottom right
            L.control.zoom({
                position: 'bottomright'
            }).addTo(mapInstance);

            // Add click handler to add location
            mapInstance.on('click', (e) => {
                const { lat, lng } = e.latlng;

                // Reverse geocode to get location name
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                    .then(res => res.json())
                    .then(data => {
                        const locationName = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || 'Unknown';
                        onLocationSelect({
                            name: locationName,
                            lat: lat,
                            lng: lng,
                            place_id: data.place_id
                        });
                    })
                    .catch(() => {
                        onLocationSelect({
                            name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                            lat: lat,
                            lng: lng
                        });
                    });
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

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => {
            map.removeLayer(marker);
        });
        markersRef.current = {};

       // Add markers for each location
zones.forEach(zone => {
    // Convert delivery_fee to number for comparison
    const fee = parseFloat(zone.delivery_fee);
    const color = fee === 0 ? '#10b981' : '#f59e0b';

    zone.locations?.forEach(location => {
        if (location.latitude && location.longitude) {
            const marker = L.marker([location.latitude, location.longitude], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="
                        background-color: ${color};
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        cursor: pointer;
                    "></div>`,
                    iconSize: [14, 14],
                    popupAnchor: [0, -7]
                })
            }).addTo(map);

            marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 150px;">
                    <strong style="color: #1f2937;">${location.location_name}</strong><br/>
                    <span style="color: #6b7280; font-size: 12px;">Zone: ${zone.name}</span><br/>
                    <span style="color: ${color}; font-size: 13px; font-weight: bold;">Fee: ₱${fee.toLocaleString()}</span>
                </div>
            `);

            markersRef.current[location.id] = marker;
        }
    });
});
    }, [zones, map]);

    // Center map on selected zone
    useEffect(() => {
        if (!map || !selectedZoneId) return;

        const selectedZone = zones.find(z => z.id === selectedZoneId);
        if (selectedZone && selectedZone.locations?.length > 0) {
            const firstLocation = selectedZone.locations.find(l => l.latitude);
            if (firstLocation) {
                map.setView([firstLocation.latitude, firstLocation.longitude], 12);
            }
        }
    }, [selectedZoneId, zones, map]);

    return (
        <div className="space-y-3">
            {/* Search Bar */}
            <div className="bg-stone-800 rounded-lg p-3">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                        placeholder="Search for a city or location..."
                        className="flex-1 px-3 py-2 rounded-md bg-stone-900 border border-stone-700 text-white text-sm focus:border-amber-500 focus:ring-amber-500"
                    />
                    <button
                        onClick={searchLocation}
                        disabled={isSearching}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm disabled:opacity-50"
                    >
                        {isSearching ? '...' : 'Search'}
                    </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-2 bg-stone-900 rounded-lg overflow-hidden">
                        {searchResults.map((result, index) => (
                            <button
                                key={index}
                                onClick={() => selectLocation(result)}
                                className="w-full text-left px-3 py-2 text-sm text-stone-300 hover:bg-stone-800 border-b border-stone-800 last:border-0 transition-colors"
                            >
                                {result.display_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="bg-stone-800 rounded-lg p-3">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-white/20"></div>
                        <span className="text-stone-300">Free Delivery (₱0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 ring-1 ring-white/20"></div>
                        <span className="text-stone-300">Paid Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-stone-500 ring-1 ring-white/20"></div>
                        <span className="text-stone-300">Click map to add location</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div
                id="delivery-map"
                style={{ height: '520px', width: '100%', borderRadius: '8px', zIndex: 1 }}
                className="rounded-lg overflow-hidden border border-stone-700 shadow-lg"
            />

            <p className="text-xs text-stone-500 text-center">
                💡 Click anywhere on the map or search for a location to add to the selected zone
            </p>
        </div>
    );
}
