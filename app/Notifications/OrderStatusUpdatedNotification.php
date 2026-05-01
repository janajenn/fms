<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderStatusUpdatedNotification extends Notification
{
    use Queueable;

    protected $order;
    protected $oldStatus;
    protected $newStatus;

    public function __construct(Order $order, $oldStatus, $newStatus)
    {
        $this->order = $order;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        $statusMessages = [
            'pending' => 'Order Placed',
            'processing' => 'Being Processed',
            'shipped' => 'Out for Delivery',
            'completed' => 'Delivered',
            'cancelled' => 'Cancelled',
        ];

        $message = "Order #{$this->order->order_number} status updated to: {$statusMessages[$this->newStatus]}";

        return [
            'type' => 'order_status_updated',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => $message,
           'action_url' => route('customer.orders.show', $this->order->id), // Customer goes to order details
            'created_at' => now()->toISOString(),
        ];
    }
}
