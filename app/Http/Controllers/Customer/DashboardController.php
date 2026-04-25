<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $recentOrders = Order::where('user_id', $user->id)
            ->with(['items.product', 'items.size'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($order) {
                // Add estimated delivery date (5-7 days from order date)
                $order->estimated_delivery = $order->created_at->addDays(7);
                return $order;
            });

        $totalOrders = Order::where('user_id', $user->id)->count();
        $totalSpent = Order::where('user_id', $user->id)->sum('total_price');
        $pendingDeliveryCount = Order::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing', 'shipped'])
            ->count();

        return Inertia::render('Customer/Dashboard', [
            'recentOrders' => $recentOrders,
            'stats' => [
                'totalOrders' => $totalOrders,
                'totalSpent' => $totalSpent,
            ],
            'pendingDeliveryCount' => $pendingDeliveryCount,
        ]);
    }
}
