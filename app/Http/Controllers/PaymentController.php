<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PayMongoService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    protected $paymongo;

    public function __construct(PayMongoService $paymongo)
    {
        $this->paymongo = $paymongo;
    }

    /**
     * Initiate payment for an order
     */
    public function initiate(Order $order)
    {
        \Log::info('Payment initiate called for order: ' . $order->id);
        \Log::info('Order payment status: ' . $order->payment_status);

        // Check if order belongs to the logged-in user
        if ($order->user_id !== auth()->id()) {
            \Log::error('Order does not belong to user: ' . auth()->id());
            abort(403);
        }

        // Check if order is in pending payment status
        $validPaymentStatuses = ['pending_payment', 'pending_downpayment'];

        if (!in_array($order->payment_status, $validPaymentStatuses)) {
            \Log::error('Order payment status is not valid: ' . $order->payment_status);
            return redirect()->route('customer.orders.show', $order)
                ->with('error', 'This order cannot be paid for.');
        }

        // Check if payment URL already exists and is still valid (not expired)
        if ($order->paymongo_checkout_url && $order->payment_expires_at > now()) {
            \Log::info('Using existing checkout URL: ' . $order->paymongo_checkout_url);
            return redirect()->away($order->paymongo_checkout_url);
        }

        try {
            $successUrl = route('payment.success', $order);
            $cancelUrl = route('payment.cancel', $order);

            \Log::info('Success URL: ' . $successUrl);
            \Log::info('Cancel URL: ' . $cancelUrl);

            $result = $this->paymongo->createCheckoutSession($order, $successUrl, $cancelUrl);

            \Log::info('PayMongo result: ', $result);

            // Save the checkout URL and payment ID to order
            $order->update([
                'paymongo_checkout_url' => $result['checkout_url'],
                'paymongo_payment_id' => $result['payment_id'],
                'payment_expires_at' => now()->addHours(24),
            ]);

            \Log::info('Redirecting to: ' . $result['checkout_url']);

            // Use redirect()->away() for external URLs
            return redirect()->away($result['checkout_url']);

        } catch (\Exception $e) {
            \Log::error('Payment initiation failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->route('customer.orders.show', $order)
                ->with('error', 'Unable to initiate payment: ' . $e->getMessage());
        }
    }

    /**
     * Payment success callback
     */
    public function success(Order $order)
    {
        // Check if order belongs to the logged-in user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if payment is already processed
        if ($order->payment_status === 'paid') {
            return redirect()->route('customer.orders.show', $order)
                ->with('success', 'Payment already confirmed. Thank you!');
        }

        return view('payment.success', compact('order'));
    }

    /**
     * Payment cancelled callback
     */
    public function cancel(Order $order)
    {
        // Check if order belongs to the logged-in user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        return view('payment.cancel', compact('order'));
    }

    /**
     * Check payment status manually (for AJAX polling)
     */
    public function checkStatus(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'payment_status' => $order->payment_status,
            'status' => $order->status,
        ]);
    }
}
