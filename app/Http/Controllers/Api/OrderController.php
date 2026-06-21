<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemCustomization;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use App\Services\DeliveryZoneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    protected $deliveryZoneService;

    public function __construct(DeliveryZoneService $deliveryZoneService)
    {
        $this->deliveryZoneService = $deliveryZoneService;
    }

    /**
     * Process checkout and create an order (API version)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|string',
            'city' => 'required|string',
            'barangay' => 'nullable|string',
            'postal_code' => 'nullable|string',
            'phone' => 'required|string',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:cod,gcash,paymaya,bank_transfer',
            'delivery_fee' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // Get cart items for authenticated user
        $cartItems = Cart::where('user_id', Auth::id())->get();
        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 422);
        }

        // Calculate shipping fee (from session or zone service, but for API we compute)
        $shipping = $validated['delivery_fee'] ?? 0;
        if (!$shipping) {
            $deliveryResult = $this->deliveryZoneService->checkDeliverability($validated['city'], $validated['barangay']);
            $shipping = $deliveryResult ? $deliveryResult['fee'] : 0;
        }

        // Optional: validate delivery again
        if (!$this->deliveryZoneService->checkDeliverability($validated['city'], $validated['barangay'])) {
            return response()->json(['error' => 'We do not deliver to this area'], 422);
        }

        DB::beginTransaction();
        try {
            $user = Auth::user();

            $subtotal = $cartItems->sum(fn($item) => $item->unit_price * $item->quantity);
            $tax = $subtotal * 0.12;
            $total = $subtotal + $tax + $shipping;

            $downPaymentPercentage = 30;
            if ($validated['payment_method'] === 'cod') {
                $downPaymentAmount = ($total * $downPaymentPercentage) / 100;
                $remainingBalance = $total - $downPaymentAmount;
                $paymentStatus = 'pending_downpayment';
                $orderStatus = 'pending';
            } else {
                $downPaymentAmount = $total;
                $remainingBalance = 0;
                $paymentStatus = 'pending_payment';
                $orderStatus = 'pending';
            }

            $storeLat = config('app.store_location.latitude');
            $storeLng = config('app.store_location.longitude');
            $storeName = config('app.store_location.name');

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'total_price' => $total,
                'shipping_cost' => $shipping,
                'status' => $orderStatus,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'down_payment_percentage' => $downPaymentPercentage,
                'down_payment_amount' => $downPaymentAmount,
                'remaining_balance' => $remainingBalance,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'shipping_address' => json_encode([
                    'address' => $validated['address'],
                    'barangay' => $validated['barangay'],
                    'city' => $validated['city'],
                    'postal_code' => $validated['postal_code'],
                    'phone' => $validated['phone'],
                    'notes' => $validated['notes'],
                ]),
                'receiver_latitude' => $validated['latitude'] ?? null,
                'receiver_longitude' => $validated['longitude'] ?? null,
                'receiver_city' => $validated['city'],
                'receiver_barangay' => $validated['barangay'],
                'sender_latitude' => $storeLat,
                'sender_longitude' => $storeLng,
                'sender_name' => $storeName,
            ]);

            // Create order items
            foreach ($cartItems as $cartItem) {
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'size_id' => $cartItem->size_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->unit_price,
                ]);

                if ($cartItem->customizations) {
                    foreach ($cartItem->customizations as $categoryId => $options) {
                        foreach ($options as $option) {
                            OrderItemCustomization::create([
                                'order_item_id' => $orderItem->id,
                                'attribute' => $option['name'],
                                'value' => $option['name'],
                                'price_modifier' => $option['price_modifier'],
                            ]);
                        }
                    }
                }
            }

            // Clear cart
            Cart::where('user_id', Auth::id())->delete();

            // Notify admin (optional but keep)
            $admins = User::where('is_admin', true)->get();
            foreach ($admins as $admin) {
                $admin->notify(new NewOrderNotification($order));
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'order_id' => $order->id,
                'message' => 'Order placed successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout API error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to place order'], 500);
        }
    }
}
