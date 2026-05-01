<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Cart;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Get cart count for the current user/session
        $cartCount = 0;

        if (Auth::check()) {
            // Logged in user
            $cartCount = Cart::where('user_id', Auth::id())->sum('quantity');
        } else {
            // Guest user
            $sessionId = $request->cookie('cart_session');
            if ($sessionId) {
                $cartCount = Cart::where('session_id', $sessionId)->sum('quantity');
            }
        }

        // Get notifications for authenticated user
        $notifications = [];
        $unreadCount = 0;

        if (Auth::check()) {
            $user = Auth::user();
            $notifications = $user->notifications()->latest()->take(20)->get()->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });
            $unreadCount = $user->unreadNotifications->count();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'is_admin' => $request->user()->is_admin,
                ] : null,
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'cartCount' => $cartCount,
        ]);
    }
}
