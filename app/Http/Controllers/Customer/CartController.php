<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;



class CartController extends Controller
{


    private function calculateShipping($request)
    {
        $freeShippingCities = ['Cagayan de Oro', 'Cagayan De Oro', 'CDO', 'El Salvador', 'El Salvador City'];

        // Check if user is logged in and has a saved city
        if (Auth::check() && Auth::user()->city) {
            if (in_array(Auth::user()->city, $freeShippingCities)) {
                return 0;
            }
        }

        // Check session for temporary city (for guest checkout)
        if ($request->session()->has('shipping_city')) {
            $city = $request->session()->get('shipping_city');
            if (in_array($city, $freeShippingCities)) {
                return 0;
            }
        }

        // Default shipping cost
        return 150;
    }

    // Add a method to update shipping city (can be called via AJAX)
    public function updateShippingCity(Request $request)
    {
        $request->validate([
            'city' => 'required|string',
        ]);

        $request->session()->put('shipping_city', $request->city);

        // If user is logged in, save to their profile
        if (Auth::check()) {
            Auth::user()->update(['city' => $request->city]);
        }

        return response()->json(['shipping' => $this->calculateShipping($request)]);
    }


     public function index(Request $request)
    {
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.images', 'product.category', 'size'])
            ->get();

        $subtotal = $cartItems->sum(function($item) {
            return $item->unit_price * $item->quantity;
        });

        $tax = $subtotal * 0.12;

        // Don't calculate shipping in cart - it will be calculated at checkout
        $shipping = null;
        $total = $subtotal + $tax;

        $cartCount = $cartItems->sum('quantity');

        return Inertia::render('Customer/Cart/Index', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'total' => $total,
            'cartCount' => $cartCount,
        ]);
    }

    public function add(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'size_id' => 'nullable|exists:product_sizes,id',
            'customizations' => 'nullable|array',
        ]);

        $unitPrice = $product->base_price;

        if (!empty($validated['size_id'])) {
            $size = $product->sizes()->find($validated['size_id']);
            if ($size) {
                $unitPrice += $size->additional_price;
            }
        }

        if (!empty($validated['customizations'])) {
            foreach ($validated['customizations'] as $categoryId => $options) {
                foreach ($options as $option) {
                    $unitPrice += $option['price_modifier'];
                }
            }
        }

        $existingItem = Cart::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->when(!empty($validated['size_id']), function($query) use ($validated) {
                return $query->where('size_id', $validated['size_id']);
            })
            ->when(empty($validated['size_id']), function($query) {
                return $query->whereNull('size_id');
            })
            ->first();

        if ($existingItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + $validated['quantity'],
            ]);
        } else {
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'size_id' => !empty($validated['size_id']) ? $validated['size_id'] : null,
                'quantity' => $validated['quantity'],
                'customizations' => $validated['customizations'],
                'unit_price' => $unitPrice,
            ]);
        }

        return redirect()->back()->with('success', 'Product added to cart!');
    }

    public function update(Request $request, $cartId)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $cartItem = Cart::where('user_id', Auth::id())
                ->where('id', $cartId)
                ->first();

            if (!$cartItem) {
                return response()->json(['error' => 'Item not found'], 404);
            }

            $cartItem->update(['quantity' => $validated['quantity']]);

            // Return updated cart data
            $cartItems = Cart::where('user_id', Auth::id())
                ->with(['product.images', 'product.category', 'size'])
                ->get();

            $subtotal = $cartItems->sum(function($item) {
                return $item->unit_price * $item->quantity;
            });

            $tax = $subtotal * 0.12;
            $total = $subtotal + $tax;
            $cartCount = $cartItems->sum('quantity');

            return response()->json([
                'success' => true,
                'message' => 'Cart updated successfully!',
                'cartItems' => $cartItems,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'cartCount' => $cartCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart update failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update cart'], 500);
        }
    }

    public function remove(Request $request, $cartId)
    {
        try {
            $cartItem = Cart::where('user_id', Auth::id())
                ->where('id', $cartId)
                ->first();

            if (!$cartItem) {
                return response()->json(['error' => 'Item not found'], 404);
            }

            $cartItem->delete();

            // Return updated cart data
            $cartItems = Cart::where('user_id', Auth::id())
                ->with(['product.images', 'product.category', 'size'])
                ->get();

            $subtotal = $cartItems->sum(function($item) {
                return $item->unit_price * $item->quantity;
            });

            $tax = $subtotal * 0.12;
            $total = $subtotal + $tax;
            $cartCount = $cartItems->sum('quantity');

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart!',
                'cartItems' => $cartItems,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'cartCount' => $cartCount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart remove failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to remove item'], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            Cart::where('user_id', Auth::id())->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared successfully!',
                'cartItems' => [],
                'subtotal' => 0,
                'tax' => 0,
                'total' => 0,
                'cartCount' => 0,
            ]);
        } catch (\Exception $e) {
            \Log::error('Cart clear failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to clear cart'], 500);
        }
    }

}
