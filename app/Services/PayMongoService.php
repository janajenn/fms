<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayMongoService
{
    protected $secretKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('paymongo.secret_key');
        $this->baseUrl = config('paymongo.base_url');

        Log::info('PayMongo Service initialized with base URL: ' . $this->baseUrl);
    }

    public function createCheckoutSession($order, $successUrl, $cancelUrl)
    {
        Log::info('Creating checkout session for order: ' . $order->order_number);
        Log::info('Order total: ' . $order->total_price);

        $lineItems = [];

        foreach ($order->items as $item) {
            $amount = (int)($item->price * 100);
            Log::info('Item: ' . $item->product->name . ' - Amount: ' . $amount . ' centavos');

            $lineItems[] = [
                'name' => $item->product->name,
                'quantity' => $item->quantity,
                'amount' => $amount,
                'currency' => 'PHP'
            ];
        }

        // Add shipping as a line item
        if ($order->shipping_cost > 0) {
            $shippingAmount = (int)($order->shipping_cost * 100);
            Log::info('Shipping amount: ' . $shippingAmount . ' centavos');

            $lineItems[] = [
                'name' => 'Shipping Fee',
                'quantity' => 1,
                'amount' => $shippingAmount,
                'currency' => 'PHP'
            ];
        }

        $payload = [
            'data' => [
                'attributes' => [
                    'send_email_receipt' => false,
                    'show_description' => true,
                    'show_line_items' => true,
                    'cancel_url' => $cancelUrl,
                    'success_url' => $successUrl,
                    'description' => "Order #{$order->order_number}",
                    'line_items' => $lineItems,
                    'payment_method_types' => ['gcash'],
                    'reference_number' => $order->order_number,
                    'metadata' => [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number
                    ]
                ]
            ]
        ];

        Log::info('PayMongo payload: ', $payload);

       $response = Http::withBasicAuth($this->secretKey, '')
    ->withOptions([
        'verify' => false,  // Disables SSL verification (TEST ONLY)
    ])
    ->withHeaders([
        'Content-Type' => 'application/json',
    ])
    ->post($this->baseUrl . '/checkout_sessions', $payload);

        Log::info('PayMongo response status: ' . $response->status());
        Log::info('PayMongo response body: ' . $response->body());

        if ($response->failed()) {
            throw new \Exception('PayMongo API Error: ' . $response->body());
        }

        $result = $response->json();

        return [
            'checkout_url' => $result['data']['attributes']['checkout_url'],
            'payment_id' => $result['data']['id']
        ];
    }



    /**
     * Retrieve a payment by ID
     */
    public function getPayment($paymentId)
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get($this->baseUrl . '/payments/' . $paymentId);

        if ($response->failed()) {
            return null;
        }

        return $response->json();
    }
}
