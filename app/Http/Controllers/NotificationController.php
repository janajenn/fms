<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|exists:notifications,id',
        ]);

        $notification = Auth::user()->notifications()->find($request->notification_id);
        if ($notification) {
            $notification->markAsRead();
        }

        // Redirect back to the previous page
        return redirect()->back();
    }

    public function markAllAsRead(Request $request)
    {
        Auth::user()->unreadNotifications->markAsRead();

        // Redirect back to the previous page
        return redirect()->back();
    }

    public function markAndRedirect(Request $request)
    {
        $request->validate([
            'notification_id' => 'required|exists:notifications,id',
            'redirect_url' => 'required|string',
        ]);

        $notification = Auth::user()->notifications()->find($request->notification_id);
        if ($notification) {
            $notification->markAsRead();
        }

        // Redirect to the specified URL
        return redirect($request->redirect_url);
    }
}
