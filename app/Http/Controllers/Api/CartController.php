<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get the current user's cart contents
     */
    public function index()
    {
        $cartItems = Cart::where('user_id', Auth::id())
            ->with(['product.images', 'product.category', 'size'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->unit_price,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'image_url' => $item->product->images->first()
                            ? url('/storage/' . $item->product->images->first()->image_path)
                            : null,
                    ],
                    'size' => $item->size ? [
                        'id' => $item->size->id,
                        'size' => $item->size->size,
                    ] : null,
                ];
            });

        $subtotal = $cartItems->sum(fn($item) => $item['price'] * $item['quantity']);
        $tax = $subtotal * 0.12;
        $total = $subtotal + $tax;

        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'count' => $cartItems->sum('quantity'),
        ]);
    }

    /**
     * Add a product to the cart
     */
    public function add(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'size_id' => 'nullable|exists:product_sizes,id',
            'customizations' => 'nullable|array',
        ]);

        $unitPrice = $product->base_price;

        if ($request->size_id) {
            $size = $product->sizes()->find($request->size_id);
            if ($size) $unitPrice += $size->additional_price;
        }

        if ($request->customizations) {
            foreach ($request->customizations as $options) {
                foreach ($options as $option) {
                    $unitPrice += $option['price_modifier'];
                }
            }
        }

        $existingItem = Cart::where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->when($request->size_id, fn($q) => $q->where('size_id', $request->size_id))
            ->when(!$request->size_id, fn($q) => $q->whereNull('size_id'))
            ->first();

        if ($existingItem) {
            $existingItem->increment('quantity', $request->quantity);
        } else {
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $product->id,
                'size_id' => $request->size_id,
                'quantity' => $request->quantity,
                'customizations' => $request->customizations,
                'unit_price' => $unitPrice,
            ]);
        }

        return response()->json(['message' => 'Product added to cart'], 200);
    }

    /**
     * Update quantity of a cart item
     */
    public function update(Request $request, $cartId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $cartItem = Cart::where('user_id', Auth::id())->findOrFail($cartId);
        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'Cart updated']);
    }

    /**
     * Remove an item from cart
     */
    public function remove($cartId)
    {
        $cartItem = Cart::where('user_id', Auth::id())->findOrFail($cartId);
        $cartItem->delete();

        return response()->json(['message' => 'Item removed']);
    }

    /**
     * Clear the entire cart
     */
    public function clear()
    {
        Cart::where('user_id', Auth::id())->delete();
        return response()->json(['message' => 'Cart cleared']);
    }
}
