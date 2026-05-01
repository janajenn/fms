<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewOrderNotification extends Notification
{
    use Queueable;

    protected $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'new_order',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer_name,
            'total_amount' => $this->order->total_price,
            'message' => "New order #{$this->order->order_number} from {$this->order->customer_name} - ₱" . number_format($this->order->total_price, 2),
            'action_url' => route('admin.orders.show', $this->order->id), // Admin goes to order details
            'created_at' => now()->toISOString(),
        ];
    }
}
