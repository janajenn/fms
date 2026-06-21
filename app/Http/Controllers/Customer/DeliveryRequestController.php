<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZoneRequest;
use App\Services\DeliveryZoneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class DeliveryRequestController extends Controller
{
    protected $deliveryZoneService;

    public function __construct(DeliveryZoneService $deliveryZoneService)
    {
        $this->deliveryZoneService = $deliveryZoneService;
    }

     public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'requested_city' => 'required|string|max:255',
            'requested_barangay' => 'nullable|string|max:255',
            'full_address' => 'required|string',
            'notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',   // <-- new
            'longitude' => 'nullable|numeric',  // <-- new
        ]);

        $deliveryRequest = DeliveryZoneRequest::create([
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'] ?? null,
            'customer_phone' => $validated['customer_phone'],
            'requested_city' => $validated['requested_city'],
            'requested_barangay' => $validated['requested_barangay'] ?? null,
            'full_address' => $validated['full_address'],
            'notes' => $validated['notes'] ?? null,
            'latitude' => $validated['latitude'] ?? null,   // <--
            'longitude' => $validated['longitude'] ?? null, // <--
            'status' => 'pending',
        ]);

        Log::info('New delivery request submitted', ['request_id' => $deliveryRequest->id]);

        return response()->json([
            'success' => true,
            'message' => 'Your delivery request has been submitted. We will contact you within 24-48 hours.',
        ], 200);

    } catch (\Exception $e) {
        Log::error('Delivery request failed: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to submit request. Please try again.'
        ], 500);
    }
}

    private function notifyAdmin($deliveryRequest)
    {
        // TODO: Implement admin notification
        // Can send email to admin, create dashboard notification, etc.
        Log::info('New delivery request submitted', [
            'request_id' => $deliveryRequest->id,
            'city' => $deliveryRequest->requested_city
        ]);
    }
}
