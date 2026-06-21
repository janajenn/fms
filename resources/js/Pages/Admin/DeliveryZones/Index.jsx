import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import ActionButtons from '@/Components/ActionButtons';
import DeliveryZoneMap from '@/Components/Admin/DeliveryZoneMap';

export default function Index({ zones }) {
    const { showToast } = useToast();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState(null);
    const [expandedZones, setExpandedZones] = useState({});
    const [mapLocationModal, setMapLocationModal] = useState(false);
    const [pendingLocation, setPendingLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        delivery_fee: 0,
        is_active: true,
        sort_order: 0,
    });
    const [locationForm, setLocationForm] = useState({
        location_type: 'city',
        location_name: '',
        parent_city: '',
        latitude: null,
        longitude: null,
        place_id: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const toggleZoneExpand = (zoneId, e) => {
        e.stopPropagation();
        setExpandedZones(prev => ({
            ...prev,
            [zoneId]: !prev[zoneId]
        }));
    };

    const handleZoneClick = (zoneId) => {
        // If the clicked zone is already selected, deselect it
        if (selectedZoneId === zoneId) {
            setSelectedZoneId(null);
        } else {
            setSelectedZoneId(zoneId);
        }
    };

    const clearSelection = () => {
        setSelectedZoneId(null);
    };

    const openCreateModal = () => {
        setSelectedZone(null);
        setFormData({
            name: '',
            description: '',
            delivery_fee: 0,
            is_active: true,
            sort_order: zones.length,
        });
        setModalOpen(true);
    };

    const openEditModal = (zone, e) => {
        e.stopPropagation();
        setSelectedZone(zone);
        setFormData({
            name: zone.name,
            description: zone.description || '',
            delivery_fee: zone.delivery_fee,
            is_active: zone.is_active,
            sort_order: zone.sort_order,
        });
        setModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name) {
            showToast('error', 'Error', 'Zone name is required');
            return;
        }

        setIsSubmitting(true);

        if (selectedZone) {
            router.put(route('admin.delivery-zones.update', selectedZone.id), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setModalOpen(false);
                    showToast('success', 'Updated', 'Delivery zone updated successfully');
                },
                onError: () => {
                    setIsSubmitting(false);
                    showToast('error', 'Error', 'Failed to update delivery zone');
                },
            });
        } else {
            router.post(route('admin.delivery-zones.store'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    setModalOpen(false);
                    showToast('success', 'Created', 'Delivery zone created successfully');
                },
                onError: () => {
                    setIsSubmitting(false);
                    showToast('error', 'Error', 'Failed to create delivery zone');
                },
            });
        }
    };

    const handleDeleteZone = (zone, e) => {
        e.stopPropagation();
        confirmDialog({
            header: 'Delete Delivery Zone',
            message: `Are you sure you want to delete "${zone.name}"? This will also remove all locations in this zone.`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                router.delete(route('admin.delivery-zones.destroy', zone.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Deleted', 'Delivery zone deleted successfully');
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to delete delivery zone');
                    },
                });
            },
        });
    };

    const handleRemoveLocation = (location, zoneName) => {
        confirmDialog({
            header: 'Remove Location',
            message: `Are you sure you want to remove "${location.location_name}" from "${zoneName}" zone?`,
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            accept: () => {
                router.delete(route('admin.delivery-zones.remove-location', location.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        showToast('success', 'Removed', 'Location removed successfully');
                    },
                    onError: () => {
                        showToast('error', 'Error', 'Failed to remove location');
                    },
                });
            },
        });
    };

    const toggleZoneStatus = (zone, e) => {
        e.stopPropagation();
        router.put(route('admin.delivery-zones.update', zone.id), {
            ...zone,
            is_active: !zone.is_active,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('success', 'Updated', `Zone ${!zone.is_active ? 'activated' : 'deactivated'} successfully`);
            },
        });
    };

    const handleMapLocationSelect = (location) => {
        setPendingLocation(location);
        setLocationForm({
            location_type: 'city',
            location_name: location.name,
            parent_city: '',
            latitude: location.lat,
            longitude: location.lng,
            place_id: location.place_id ? String(location.place_id) : null,
        });
        setMapLocationModal(true);
    };

    const handleAddMapLocation = () => {
        if (!locationForm.location_name) {
            showToast('error', 'Error', 'Location name is required');
            return;
        }
        if (!selectedZoneId) {
            showToast('error', 'Error', 'Please select a zone first');
            return;
        }
        setIsSubmitting(true);
        router.post(route('admin.delivery-zones.add-location-coordinates', selectedZoneId), locationForm, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                setMapLocationModal(false);
                setPendingLocation(null);
                setLocationForm({
                    location_type: 'city',
                    location_name: '',
                    parent_city: '',
                    latitude: null,
                    longitude: null,
                    place_id: null,
                });
                showToast('success', 'Added', 'Location added to zone successfully');
            },
            onError: (errors) => {
                console.error('Error response:', errors);
                setIsSubmitting(false);
                showToast('error', 'Error', errors.message || 'Failed to add location');
            },
        });
    };

    const modalFooter = (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Saving...' : 'Save Zone'}
            </button>
        </div>
    );

    const mapLocationModalFooter = (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => setMapLocationModal(false)}
                className="px-4 py-2 border border-stone-700 rounded-md text-stone-300 hover:bg-stone-900"
            >
                Cancel
            </button>
            <button
                onClick={handleAddMapLocation}
                disabled={isSubmitting}
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
                {isSubmitting ? 'Adding...' : 'Add Location'}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Delivery Zones" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-white">Delivery Zones</h1>
                            <p className="text-stone-400 mt-1">Manage delivery zones and their locations</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Add New Zone
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Zones List */}
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {zones.map((zone) => (
                                <div
                                    key={zone.id}
                                    className={`bg-black border rounded-lg overflow-hidden transition-all cursor-pointer ${
                                        selectedZoneId === zone.id
                                            ? 'border-amber-500 ring-2 ring-amber-500/50'
                                            : 'border-stone-800 hover:border-stone-600'
                                    }`}
                                    onClick={() => handleZoneClick(zone.id)}
                                >
                                    {/* Zone Header */}
                                    <div className="px-4 py-3 bg-stone-900 border-b border-stone-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <button
                                                    onClick={(e) => toggleZoneExpand(zone.id, e)}
                                                    className="p-0.5 text-stone-400 hover:text-amber-500 transition-colors"
                                                    title={expandedZones[zone.id] ? 'Collapse' : 'Expand'}
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transition-transform duration-200 ${expandedZones[zone.id] ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-white font-medium">{zone.name}</h3>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${zone.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                                        {zone.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className="text-amber-400 text-sm">₱{zone.delivery_fee.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => toggleZoneStatus(zone, e)}
                                                    className="p-1 text-stone-400 hover:text-amber-500 transition-colors"
                                                    title={zone.is_active ? 'Deactivate' : 'Activate'}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={zone.is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
                                                    </svg>
                                                </button>
                                                <ActionButtons
                                                    onEdit={(e) => openEditModal(zone, e)}
                                                    onDelete={(e) => handleDeleteZone(zone, e)}
                                                    showEdit={true}
                                                    showDelete={true}
                                                    showView={false}
                                                    showStockIn={false}
                                                    showStockOut={false}
                                                />
                                            </div>
                                        </div>
                                        {zone.description && (
                                            <p className="text-xs text-stone-400 mt-2 ml-5">{zone.description}</p>
                                        )}
                                        {selectedZoneId === zone.id && (
                                            <div className="flex items-center justify-between mt-2 ml-5">
                                                <div className="text-xs text-amber-500">
                                                    ✓ Currently selected – click map to add locations
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                                                    className="text-xs text-stone-400 hover:text-white underline"
                                                >
                                                    Clear selection
                                                </button>
                                            </div>
                                        )}
                                        <div className="mt-2 ml-5">
                                            <span className="text-[10px] text-stone-500 bg-stone-800 px-2 py-0.5 rounded-full">
                                                {zone.locations?.length || 0} locations
                                            </span>
                                            {selectedZoneId === zone.id && !expandedZones[zone.id] && zone.locations?.length > 0 && (
                                                <span className="text-[10px] text-amber-500 ml-2">
                                                    (Click expand to view)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Locations List */}
                                    {expandedZones[zone.id] && (
                                        <div className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                                                    All Locations
                                                </h4>
                                                {selectedZoneId === zone.id && (
                                                    <span className="text-[10px] text-amber-500">Click map to add</span>
                                                )}
                                            </div>
                                            {zone.locations && zone.locations.length > 0 ? (
                                                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                                    {zone.locations.map((loc) => {
                                                        const lat = loc.latitude ? parseFloat(loc.latitude) : null;
                                                        const lng = loc.longitude ? parseFloat(loc.longitude) : null;
                                                        const hasValidCoordinates = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);
                                                        return (
                                                            <div key={loc.id} className="flex items-center justify-between bg-stone-800/50 rounded-md px-2 py-1.5 hover:bg-stone-800 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                                        <span className="text-sm text-white truncate max-w-[150px]">
                                                                            {loc.location_name}
                                                                        </span>
                                                                        <span className="text-[10px] text-stone-400 bg-stone-700 px-1.5 py-0.5 rounded">
                                                                            {loc.location_type}
                                                                        </span>
                                                                        {loc.parent_city && (
                                                                            <span className="text-[10px] text-stone-500">
                                                                                ({loc.parent_city})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {hasValidCoordinates && (
                                                                        <div className="text-[9px] text-stone-500 mt-0.5 truncate">
                                                                            📍 {lat.toFixed(4)}, {lng.toFixed(4)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveLocation(loc, zone.name)}
                                                                    className="ml-2 p-1 text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                                                                    title="Remove Location"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-stone-500 text-center py-4">
                                                    No locations added yet.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {zones.length === 0 && (
                                <div className="bg-black border border-stone-800 rounded-lg p-8 text-center">
                                    <p className="text-stone-400">No delivery zones yet.</p>
                                    <button onClick={openCreateModal} className="mt-2 text-amber-500 text-sm">Create your first zone</button>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div>
                            <DeliveryZoneMap
                                zones={zones}
                                onLocationSelect={handleMapLocationSelect}
                                selectedZoneId={selectedZoneId}
                            />
                            {!selectedZoneId && (
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-3">
                                    <p className="text-xs text-amber-400 text-center">
                                        ⚠️ Select a zone from the list first, then click on map to add locations
                                    </p>
                                </div>
                            )}
                            {selectedZoneId && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mt-3">
                                    <p className="text-xs text-emerald-400 text-center">
                                        ✅ Adding locations to: <strong>{zones.find(z => z.id === selectedZoneId)?.name}</strong>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone Modal */}
            <Dialog
                header={selectedZone ? 'Edit Delivery Zone' : 'Create Delivery Zone'}
                visible={modalOpen}
                style={{ width: '500px' }}
                onHide={() => setModalOpen(false)}
                footer={modalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Zone Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="2"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Delivery Fee (₱)</label>
                        <input
                            type="number"
                            value={formData.delivery_fee}
                            onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
                            min="0"
                            step="0.01"
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        />
                        <p className="text-xs text-stone-500 mt-1">Set to 0 for free delivery</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500"
                        />
                        <label htmlFor="is_active" className="text-sm text-stone-400">Active</label>
                    </div>
                </div>
            </Dialog>

            {/* Add Location from Map Modal */}
            <Dialog
                header="Add Location from Map"
                visible={mapLocationModal}
                style={{ width: '450px' }}
                onHide={() => setMapLocationModal(false)}
                footer={mapLocationModalFooter}
                className="bg-black border border-stone-800 rounded-lg"
            >
                <div className="space-y-4">
                    <div className="bg-stone-800 rounded-lg p-3">
                        <p className="text-xs text-stone-400">Selected Location:</p>
                        <p className="text-sm text-white mt-1">{locationForm.location_name || pendingLocation?.name}</p>
                        {locationForm.latitude && locationForm.longitude && (
                            <p className="text-xs text-stone-500 mt-1">
                                📍 {locationForm.latitude.toFixed(4)}, {locationForm.longitude.toFixed(4)}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-400 mb-1">Location Type</label>
                        <select
                            value={locationForm.location_type}
                            onChange={(e) => setLocationForm({ ...locationForm, location_type: e.target.value })}
                            className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                        >
                            <option value="city">City / Municipality</option>
                            <option value="barangay">Barangay / District</option>
                        </select>
                    </div>
                    {locationForm.location_type === 'barangay' && (
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-1">Parent City / Municipality</label>
                            <input
                                type="text"
                                value={locationForm.parent_city}
                                onChange={(e) => setLocationForm({ ...locationForm, parent_city: e.target.value })}
                                placeholder="e.g., Cagayan de Oro"
                                className="w-full rounded-md bg-stone-900 border-stone-700 text-white focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                    )}
                </div>
            </Dialog>
        </AdminLayout>
    );
}
