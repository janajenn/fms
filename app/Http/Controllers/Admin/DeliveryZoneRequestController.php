<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use App\Models\DeliveryZoneRequest;
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

        $deliveryRequest->update($validated);

        // If added to zone, we might want to notify the customer
        if ($validated['status'] === 'added_to_zone' && $validated['added_to_zone_id']) {
            // TODO: Send email notification to customer
        }

        return redirect()->back()->with('success', 'Request updated successfully.');
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
