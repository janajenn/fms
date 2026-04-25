<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\DeliveryZoneLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneController extends Controller
{
    public function index()
    {
        $zones = DeliveryZone::with('locations')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/DeliveryZones/Index', [
            'zones' => $zones
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'delivery_fee' => 'required|numeric|min:0',
            'sort_order' => 'integer',
        ]);

        DeliveryZone::create($validated);

        return redirect()->back()->with('success', 'Delivery zone created successfully.');
    }

    public function update(Request $request, DeliveryZone $zone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'delivery_fee' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $zone->update($validated);

        return redirect()->back()->with('success', 'Delivery zone updated successfully.');
    }

    public function destroy(DeliveryZone $zone)
    {
        $zone->delete();
        return redirect()->back()->with('success', 'Delivery zone deleted successfully.');
    }

    public function addLocation(Request $request, DeliveryZone $zone)
    {
        $validated = $request->validate([
            'location_type' => 'required|in:city,barangay',
            'location_name' => 'required|string|max:255',
            'parent_city' => 'nullable|string|max:255',
        ]);

        $zone->locations()->create($validated);

        return redirect()->back()->with('success', 'Location added to zone successfully.');
    }

public function addLocationWithCoordinates(Request $request, DeliveryZone $zone)
{
    \Log::info('=== ADD LOCATION WITH COORDINATES ===');
    \Log::info('Zone ID: ' . $zone->id);
    \Log::info('Request data:', $request->all());

    try {
        $validated = $request->validate([
            'location_name' => 'required|string|max:255',
            'location_type' => 'required|in:city,barangay',
            'parent_city' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'place_id' => 'nullable|string', // Keep as string, but we'll convert if needed
        ]);

        // Convert place_id to string if it's numeric
        if (isset($validated['place_id'])) {
            $validated['place_id'] = (string) $validated['place_id'];
        }

        \Log::info('Validation passed', $validated);

        $location = $zone->locations()->create($validated);

        \Log::info('Location created with ID: ' . $location->id);

        return redirect()->back()->with('success', 'Location added to zone successfully.');

    } catch (\Exception $e) {
        \Log::error('Failed to add location: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        return redirect()->back()->with('error', 'Failed to add location: ' . $e->getMessage());
    }
}



    public function geocodeLocation(Request $request)
    {
        $query = $request->get('query');

        $url = "https://nominatim.openstreetmap.org/search?format=json&q=" . urlencode($query) . "&countrycodes=ph&limit=5";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'AArfeels/1.0');
        $response = curl_exec($ch);
        curl_close($ch);

        $results = json_decode($response, true);

        $formatted = [];
        foreach ($results as $result) {
            $formatted[] = [
                'name' => $result['display_name'],
                'lat' => $result['lat'],
                'lon' => $result['lon'],
                'place_id' => $result['place_id'],
            ];
        }

        return response()->json($formatted);
    }

    public function removeLocation(DeliveryZoneLocation $location)
    {
        $location->delete();
        return redirect()->back()->with('success', 'Location removed from zone successfully.');
    }


    public function getPublicZones()
{
    $zones = DeliveryZone::with(['locations' => function($query) {
        $query->whereNotNull('latitude')
              ->whereNotNull('longitude');
    }])
    ->where('is_active', true)
    ->orderBy('sort_order')
    ->get()
    ->map(function ($zone) {
        return [
            'id' => $zone->id,
            'name' => $zone->name,
            'delivery_fee' => $zone->delivery_fee,
            'locations' => $zone->locations->map(function ($location) {
                return [
                    'id' => $location->id,
                    'location_name' => $location->location_name,
                    'latitude' => (float) $location->latitude,
                    'longitude' => (float) $location->longitude,
                    'location_type' => $location->location_type,
                ];
            }),
        ];
    });

    return response()->json($zones);
}
}
