<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemCustomization;
use App\Models\StockLog;
use App\Models\MaterialStockLog;
use App\Models\CustomizationOption;
use App\Services\DeliveryZoneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected $deliveryZoneService;

    public function __construct(DeliveryZoneService $deliveryZoneService)
    {
        $this->deliveryZoneService = $deliveryZoneService;
    }

    public function index(Request $request)
    {
        $cartItems = $this->getCartItems($request);

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        $subtotal = $cartItems->sum(function($item) {
            return $item->unit_price * $item->quantity;
        });

        $tax = $subtotal * 0.12;

        $shipping = session('delivery_fee', 150);
        $total = $subtotal + $tax + $shipping;

        return Inertia::render('Customer/Checkout/Index', [
            'cartItems' => $cartItems->load(['product.images', 'product.category', 'size']),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'total' => $total,
            'user' => Auth::user(),
        ]);
    }

    public function validateDelivery(Request $request)
{
    try {
        $validated = $request->validate([
            'city' => 'required|string|max:255',
            'barangay' => 'nullable|string|max:255',
        ]);

        // Try to find the location in delivery zones
        $result = $this->deliveryZoneService->checkDeliverability(
            $validated['city'],
            $validated['barangay'] ?? null
        );

        // If not found and we have a barangay, try to search by barangay only
        if (!$result && !empty($validated['barangay'])) {
            $result = $this->deliveryZoneService->checkDeliverabilityByBarangay($validated['barangay']);
        }

        if ($result) {
            session(['delivery_fee' => $result['fee']]);

            return response()->json([
                'available' => true,
                'delivery_fee' => $result['fee'],
                'zone_name' => $result['zone']->name,
                'matched_location' => $result['matched_location'],
                'matched_on' => $result['matched_on'],
                'message' => $result['fee'] == 0 ? 'Free delivery available!' : "Delivery fee: ₱{$result['fee']}"
            ]);
        } else {
            return response()->json([
                'available' => false,
                'message' => "We don't currently deliver to {$validated['city']}. Please submit a delivery request."
            ], 200);
        }
    } catch (\Exception $e) {
        \Log::error('Delivery validation error: ' . $e->getMessage());
        return response()->json([
            'available' => false,
            'message' => 'Error validating delivery address'
        ], 200);
    }
}

public function store(Request $request)
{
    try {
        \Log::info('=== CHECKOUT STARTED ===');
        \Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string',
            'barangay' => 'nullable|string',
            'postal_code' => 'required|string',
            'phone' => 'required|string',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:cod,gcash,paymaya,bank_transfer',
            'delivery_fee' => 'nullable|numeric|min:0',
        ]);

        \Log::info('Validation passed');

        $cartItems = $this->getCartItems($request);

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty.');
        }

        // Calculate shipping
        $shipping = $validated['delivery_fee'] ?? $this->deliveryZoneService->getDeliveryFee($validated['city'], $validated['barangay'] ?? null) ?? 0;

        // Check if delivery is available
        $deliveryResult = $this->deliveryZoneService->checkDeliverability(
            $validated['city'],
            $validated['barangay'] ?? null
        );

        if (!$deliveryResult) {
            return redirect()->back()->with('error', 'We do not deliver to this area. Please submit a delivery request.');
        }

        DB::beginTransaction();

        try {
            $user = Auth::user();

            if (!$user && $request->has('create_account')) {
                $user = \App\Models\User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                    'is_admin' => false,
                ]);
                \Log::info('New user created: ' . $user->id);
            } elseif ($user) {
                $user->update(['city' => $validated['city']]);
            }

            // Calculate totals
            $subtotal = $cartItems->sum(function($item) {
                return $item->unit_price * $item->quantity;
            });
            $tax = $subtotal * 0.12;
            $total = $subtotal + $tax + $shipping;

            // Calculate down payment for COD
            $downPaymentPercentage = 30;
            $downPaymentAmount = 0;
            $remainingBalance = 0;
            $paymentStatus = 'pending';
            $orderStatus = 'pending';

           if ($validated['payment_method'] === 'cod') {
    $downPaymentAmount = ($total * $downPaymentPercentage) / 100;
    $remainingBalance = $total - $downPaymentAmount;
    $paymentStatus = 'pending_downpayment';
    $orderStatus = 'pending';
} else {
    // GCash, PayMaya, Bank Transfer - payment pending until webhook confirms
    $downPaymentAmount = $total;
    $remainingBalance = 0;
    $paymentStatus = 'pending_payment';  // MUST BE 'pending_payment'
    $orderStatus = 'pending';
}

            // Create order
            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'order_number' => 'ORD-' . strtoupper(\Illuminate\Support\Str::random(10)),
                'total_price' => $total,
                'shipping_cost' => $shipping,
                'status' => $orderStatus,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'down_payment_percentage' => $downPaymentPercentage,
                'down_payment_amount' => $downPaymentAmount,
                'remaining_balance' => $remainingBalance,
                'customer_name' => $validated['name'],
                'customer_email' => $validated['email'],
                'shipping_address' => json_encode([
                    'address' => $validated['address'],
                    'barangay' => $validated['barangay'] ?? null,
                    'city' => $validated['city'],
                    'postal_code' => $validated['postal_code'],
                    'phone' => $validated['phone'],
                    'notes' => $validated['notes'],
                ]),
            ]);

            \Log::info('Order created: ' . $order->id);

            // Create order items (but don't deduct stock for GCash until payment confirmed)
            $shouldDeductStock = ($validated['payment_method'] === 'cod');

            foreach ($cartItems as $cartItem) {
                \Log::info('Processing cart item: ' . $cartItem->id);

                // Create order item
                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'size_id' => $cartItem->size_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->unit_price,
                ]);

                \Log::info('Order item created: ' . $orderItem->id);

                // Save customizations
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
                    \Log::info('Customizations saved');
                }

                // Deduct stock only for COD orders (COD has down payment)
                if ($shouldDeductStock) {
                    // DEDUCT PRODUCT STOCK
                    if ($cartItem->size_id) {
                        $size = $cartItem->size;
                        if ($size) {
                            $stockBefore = $size->stock;
                            $size->decrement('stock', $cartItem->quantity);

                            StockLog::create([
                                'product_id' => $cartItem->product_id,
                                'size_id' => $size->id,
                                'size_label' => $size->size,
                                'user_id' => auth()->id(),
                                'type' => 'order',
                                'quantity' => $cartItem->quantity,
                                'stock_before' => $stockBefore,
                                'stock_after' => $size->stock,
                                'reason' => "Order #{$order->order_number}",
                                'order_id' => $order->id,
                            ]);
                            \Log::info('Stock deducted for size: ' . $size->size);
                        }
                    } else {
                        $inventory = $cartItem->product->inventory;
                        if ($inventory) {
                            $stockBefore = $inventory->stock;
                            $inventory->decrement('stock', $cartItem->quantity);

                            StockLog::create([
                                'product_id' => $cartItem->product_id,
                                'user_id' => auth()->id(),
                                'type' => 'order',
                                'quantity' => $cartItem->quantity,
                                'stock_before' => $stockBefore,
                                'stock_after' => $inventory->stock,
                                'reason' => "Order #{$order->order_number}",
                                'order_id' => $order->id,
                            ]);
                            \Log::info('Stock deducted for product: ' . $cartItem->product->name);
                        }
                    }

                    // DEDUCT MATERIAL STOCK
                    if ($cartItem->customizations) {
                        foreach ($cartItem->customizations as $categoryId => $options) {
                            foreach ($options as $option) {
                                $customizationOption = CustomizationOption::find($option['id']);

                                if ($customizationOption && $customizationOption->material_id) {
                                    $material = $customizationOption->material;
                                    if ($material) {
                                        $quantityToDeduct = $customizationOption->quantity_used * $cartItem->quantity;

                                        if ($material->stock < $quantityToDeduct) {
                                            throw new \Exception("Insufficient material stock: {$material->name}");
                                        }

                                        $materialStockBefore = $material->stock;
                                        $material->decrement('stock', $quantityToDeduct);

                                        MaterialStockLog::create([
                                            'material_id' => $material->id,
                                            'user_id' => auth()->id(),
                                            'type' => 'out',
                                            'quantity' => $quantityToDeduct,
                                            'stock_before' => $materialStockBefore,
                                            'stock_after' => $material->stock,
                                            'reason' => "Order #{$order->order_number} - {$cartItem->product->name} ({$option['name']})",
                                        ]);
                                        \Log::info('Material stock deducted: ' . $material->name . ' - Quantity: ' . $quantityToDeduct);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Clear cart
            $this->clearCart($request);
            session()->forget('delivery_fee');

            DB::commit();

            \Log::info('=== CHECKOUT COMPLETED SUCCESSFULLY ===');

            // Redirect based on payment method
            if ($validated['payment_method'] === 'cod') {
                return redirect()->route('payment.cod.instructions', $order)
                    ->with('success', 'Please complete your down payment to confirm your order.');
            }

            if ($validated['payment_method'] === 'gcash') {
    // Clear cart and commit transaction first
    $this->clearCart($request);
    session()->forget('delivery_fee');

    DB::commit();

    // Return a direct redirect (not Inertia)
    return redirect()->route('payment.initiate', $order);
}

            // For other payment methods (paymaya, bank_transfer)
            return redirect()->route('customer.orders.show', $order)
                ->with('success', 'Order created! Please complete the payment to confirm your order.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Transaction failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Failed to process order: ' . $e->getMessage());
        }
    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation failed: ' . json_encode($e->errors()));
        return redirect()->back()->withErrors($e->errors())->withInput();
    } catch (\Exception $e) {
        \Log::error('Checkout failed: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to process order: ' . $e->getMessage());
    }
}


    private function getCartItems(Request $request)
    {
        if (Auth::check()) {
            return Cart::where('user_id', Auth::id())->get();
        }

        $sessionId = $request->cookie('cart_session');
        if (!$sessionId) {
            return collect([]);
        }

        return Cart::where('session_id', $sessionId)->get();
    }

    private function clearCart(Request $request)
    {
        if (Auth::check()) {
            Cart::where('user_id', Auth::id())->delete();
        } else {
            $sessionId = $request->cookie('cart_session');
            if ($sessionId) {
                Cart::where('session_id', $sessionId)->delete();
            }
        }
    }
}
