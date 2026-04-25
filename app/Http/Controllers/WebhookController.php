<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentLog;
use App\Models\ProductCustomizationImage;
use App\Models\StockLog;
use App\Models\MaterialStockLog;
use App\Models\Inventory;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    /**
     * Handle PayMongo webhook
     */
    public function handlePayMongo(Request $request)
    {
        // Log incoming webhook for debugging
        \Log::info('PayMongo Webhook Received', $request->all());

        $payload = $request->all();
        $eventType = $payload['data']['attributes']['type'] ?? null;
        $paymentId = $payload['data']['attributes']['data']['id'] ?? null;

        if (!$eventType || !$paymentId) {
            return response()->json(['message' => 'Invalid webhook'], 400);
        }

        // Find order by payment_id
        $order = Order::where('paymongo_payment_id', $paymentId)->first();

        if (!$order) {
            \Log::error('Order not found for payment ID: ' . $paymentId);
            return response()->json(['message' => 'Order not found'], 200);
        }

        // Log the webhook
        PaymentLog::create([
            'order_id' => $order->id,
            'paymongo_event_type' => $eventType,
            'paymongo_payment_id' => $paymentId,
            'payload' => $payload,
            'status' => 'received',
        ]);

        // Process based on event type
        switch ($eventType) {
            case 'payment.paid':
            case 'checkout_session.payment.paid':
                $this->handleSuccessfulPayment($order, $paymentId);
                break;
            case 'payment.failed':
                $this->handleFailedPayment($order);
                break;

            default:
                \Log::info('Unhandled event type: ' . $eventType);
        }

        return response()->json(['message' => 'Webhook processed'], 200);
    }

    /**
     * Handle successful payment
     */
   private function handleSuccessfulPayment($order, $paymentId)
{
    if ($order->payment_status === 'paid') {
        \Log::info('Order already paid: ' . $order->id);
        return;
    }

    // Only process if order is in pending_payment status
    if (!in_array($order->payment_status, ['pending_payment', 'pending_downpayment'])) {
        \Log::info('Order status not pending_payment: ' . $order->payment_status);
        return;
    }

    DB::beginTransaction();

    try {
        // Update order status
        $order->update([
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);

        \Log::info('Order updated to paid and processing for order: ' . $order->id);

        // Now deduct stock for all items in the order
        foreach ($order->items as $item) {
            // Deduct product stock
            if ($item->size_id) {
                $size = ProductSize::find($item->size_id);
                if ($size) {
                    $stockBefore = $size->stock;
                    $size->decrement('stock', $item->quantity);

                    StockLog::create([
                        'product_id' => $item->product_id,
                        'size_id' => $size->id,
                        'size_label' => $size->size,
                        'user_id' => null,
                        'type' => 'order',
                        'quantity' => $item->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $size->stock,
                        'reason' => "Payment confirmed for Order #{$order->order_number}",
                        'order_id' => $order->id,
                    ]);
                    \Log::info('Stock deducted for size: ' . $size->size);
                }
            } else {
                $inventory = Inventory::where('product_id', $item->product_id)->first();
                if ($inventory) {
                    $stockBefore = $inventory->stock;
                    $inventory->decrement('stock', $item->quantity);

                    StockLog::create([
                        'product_id' => $item->product_id,
                        'user_id' => null,
                        'type' => 'order',
                        'quantity' => $item->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $inventory->stock,
                        'reason' => "Payment confirmed for Order #{$order->order_number}",
                        'order_id' => $order->id,
                    ]);
                    \Log::info('Stock deducted for product: ' . $item->product->name);
                }
            }

            // Deduct material stock for customizations
            $customizations = $item->customizations;
            if ($customizations) {
                foreach ($customizations as $customization) {
                    $option = \App\Models\CustomizationOption::find($customization->value);
                    if ($option && $option->material_id) {
                        $material = $option->material;
                        if ($material) {
                            $quantityToDeduct = $option->quantity_used * $item->quantity;
                            $materialStockBefore = $material->stock;
                            $material->decrement('stock', $quantityToDeduct);

                            MaterialStockLog::create([
                                'material_id' => $material->id,
                                'user_id' => null,
                                'type' => 'out',
                                'quantity' => $quantityToDeduct,
                                'stock_before' => $materialStockBefore,
                                'stock_after' => $material->stock,
                                'reason' => "Order #{$order->order_number} - {$item->product->name}",
                            ]);
                            \Log::info('Material stock deducted: ' . $material->name);
                        }
                    }
                }
            }
        }

        // Update payment log
        PaymentLog::where('order_id', $order->id)
            ->where('paymongo_payment_id', $paymentId)
            ->update(['status' => 'success']);

        DB::commit();

        \Log::info('Payment processed successfully for order: ' . $order->id);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Failed to process payment for order ' . $order->id . ': ' . $e->getMessage());
    }
}

    /**
     * Handle failed payment
     */
    private function handleFailedPayment($order)
    {
        if ($order->payment_status !== 'pending_downpayment') {
            return;
        }

        $order->update([
            'payment_status' => 'failed',
            'status' => 'cancelled',
        ]);

        PaymentLog::where('order_id', $order->id)
            ->where('paymongo_event_type', 'payment.failed')
            ->update(['status' => 'failed']);

        \Log::info('Payment failed for order: ' . $order->id);
    }


}
