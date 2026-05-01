<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OpenRouteService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['items.product.images'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Customer/Orders/Index', [
            'orders' => $orders
        ]);
    }

    public function show(Order $order)
    {
        // Ensure the order belongs to the authenticated user
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Load relationships - only load size if it exists
        $order->load([
            'items.product.images',
            'items.customizations'
        ]);

        // Load size relationship separately to avoid errors
        foreach ($order->items as $item) {
            if ($item->size_id) {
                $item->load('size');
            }
        }

        return Inertia::render('Customer/Orders/Show', [
            'order' => $order
        ]);
    }

    public function store(Request $request)
    {
        return redirect()->route('checkout.index');
    }


public function getRoute(Order $order, OpenRouteService $routeService)
{
    // Verify ownership
    if ($order->user_id !== auth()->id()) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Check if order has receiver coordinates
    if (!$order->receiver_latitude || !$order->receiver_longitude) {
        return response()->json([
            'error' => 'No location data available for this order',
            'has_route' => false
        ], 404);
    }

    // Get store coordinates
    $senderLat = $order->sender_latitude ? (float)$order->sender_latitude : config('app.store_location.latitude');
    $senderLng = $order->sender_longitude ? (float)$order->sender_longitude : config('app.store_location.longitude');
    $receiverLat = (float)$order->receiver_latitude;
    $receiverLng = (float)$order->receiver_longitude;

    // Get delivery progress based on order status
    $progress = $this->getDeliveryProgress($order);

    // Calculate current position based on progress percentage
    $currentLat = $senderLat;
    $currentLng = $senderLng;

    if ($progress['percentage'] > 0 && $progress['percentage'] < 100) {
        $fraction = $progress['percentage'] / 100;
        $currentLat = $senderLat + ($receiverLat - $senderLat) * $fraction;
        $currentLng = $senderLng + ($receiverLng - $senderLng) * $fraction;
    } else if ($progress['percentage'] === 100) {
        $currentLat = $receiverLat;
        $currentLng = $receiverLng;
    }

    // Get route (straight line is fine)
    $route = $routeService->getRoute($senderLat, $senderLng, $receiverLat, $receiverLng);

     // Get the full shipping address
    $shippingAddress = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);

    // Build a complete address string
    $fullAddress = '';
    if ($shippingAddress) {
        $parts = [];
        if (!empty($shippingAddress['address'])) $parts[] = $shippingAddress['address'];
        if (!empty($shippingAddress['barangay'])) $parts[] = $shippingAddress['barangay'];
        if (!empty($shippingAddress['city'])) $parts[] = $shippingAddress['city'];
        $fullAddress = implode(', ', $parts);
    }


    return response()->json([
        'success' => true,
        'has_route' => true,
        'sender' => [
            'lat' => $senderLat,
            'lng' => $senderLng,
            'name' => $order->sender_name ?? config('app.store_location.name'),
        ],
        'receiver' => [
            'lat' => $receiverLat,
            'lng' => $receiverLng,
           'full_address' => $fullAddress,  // ADD THIS
            'city' => $order->receiver_city,
            'barangay' => $order->receiver_barangay,
        ],
        'current_location' => [
            'lat' => $currentLat,
            'lng' => $currentLng,
        ],
        'delivery_progress' => $progress,
        'route' => $route,
    ]);
}




private function getDeliveryProgress($order)
{
    // Map order status to progress percentage
    $progressMap = [
        'pending' => 0,
        'processing' => 10,
        'shipped' => 50,
        'completed' => 100,
        'cancelled' => 0,
    ];

    $percentage = $progressMap[$order->status] ?? 0;

    // Get human-readable status label
    $statusLabels = [
        'pending' => 'Order Placed - Awaiting Processing',
        'processing' => 'Preparing Your Order',
        'shipped' => 'Out for Delivery',
        'completed' => 'Delivered Successfully',
        'cancelled' => 'Order Cancelled',
    ];

    return [
        'percentage' => $percentage,
        'status' => $order->status,
        'status_label' => $statusLabels[$order->status] ?? 'Processing',
    ];
}

}
