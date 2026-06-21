<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\DeliveryZoneLocation;
use Illuminate\Support\Facades\Http;
use App\Models\DeliveryZoneRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneRequestController extends Controller
{
    public function index()
    {
        $requests = DeliveryZoneRequest::with('addedToZone')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $zones = DeliveryZone::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/DeliveryZones/Requests', [
            'requests' => $requests,
            'zones' => $zones
        ]);
    }

 public function update(Request $request, DeliveryZoneRequest $deliveryRequest)
{
    $validated = $request->validate([
        'status' => 'required|in:pending,contacted,added_to_zone,rejected',
        'admin_notes' => 'nullable|string',
        'added_to_zone_id' => 'nullable|exists:delivery_zones,id',
    ]);

    if ($validated['status'] === 'added_to_zone' && !empty($validated['added_to_zone_id'])) {
        $zone = DeliveryZone::findOrFail($validated['added_to_zone_id']);

        // Determine location name and type
        $locationName = '';
        $locationType = 'city';
        $parentCity = null;

        if (!empty($deliveryRequest->requested_barangay)) {
            $locationName = $deliveryRequest->requested_barangay;
            $locationType = 'barangay';
            $parentCity = $deliveryRequest->requested_city;
        } elseif (!empty($deliveryRequest->requested_city)) {
            $locationName = $deliveryRequest->requested_city;
        } else {
            $locationName = substr($deliveryRequest->full_address, 0, 255);
        }

        // Check if already exists
        $exists = DeliveryZoneLocation::where('delivery_zone_id', $zone->id)
            ->where('location_name', $locationName)
            ->where('location_type', $locationType)
            ->exists();

        if (!$exists) {
            $latitude = $deliveryRequest->latitude;
            $longitude = $deliveryRequest->longitude;

            // If request has no coordinates, try geocoding (optional)
            if (!$latitude || !$longitude) {
                $coords = $this->geocodeAddress($locationName . ($parentCity ? ', ' . $parentCity : '') . ', Philippines');
                $latitude = $coords['lat'] ?? null;
                $longitude = $coords['lng'] ?? null;
            }

            DeliveryZoneLocation::create([
                'delivery_zone_id' => $zone->id,
                'location_name' => $locationName,
                'location_type' => $locationType,
                'parent_city' => $parentCity,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'is_active' => true,
            ]);
        }
    }

    $deliveryRequest->update($validated);

    return redirect()->back()->with('success', 'Request updated and location added to zone.');
}

private function geocodeAddress($address)
{
    try {
        $response = Http::withOptions([
            'verify' => false, // ⬅️ Disable SSL verification
        ])->get('https://nominatim.openstreetmap.org/search', [
            'format' => 'json',
            'q' => $address,
            'countrycodes' => 'ph',
            'limit' => 1,
        ]);
        $data = $response->json();
        if (!empty($data)) {
            return ['lat' => $data[0]['lat'], 'lng' => $data[0]['lon']];
        }
    } catch (\Exception $e) {
        Log::error('Geocoding failed: ' . $e->getMessage());
    }
    return ['lat' => null, 'lng' => null];
}




    public function destroy(DeliveryZoneRequest $deliveryRequest)
    {
        $deliveryRequest->delete();
        return redirect()->back()->with('success', 'Request deleted successfully.');
    }

    public function getStats()
    {
        $pendingCount = DeliveryZoneRequest::where('status', 'pending')->count();

        return response()->json([
            'pending_count' => $pendingCount
        ]);
    }
}
