<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Redirect to admin dashboard if user is admin
        if ($user->is_admin) {
            return redirect()->route('admin.dashboard');
        }

        // Otherwise redirect to customer dashboard
        return redirect()->route('customer.dashboard');
    }
}
