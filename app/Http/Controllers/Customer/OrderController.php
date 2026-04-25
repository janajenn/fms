<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
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
}
