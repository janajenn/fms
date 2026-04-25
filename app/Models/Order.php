<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

protected $fillable = [
    'user_id',
    'order_number',
    'customer_name',
    'customer_email',
    'total_price',
    'shipping_cost',
    'status',
    'payment_method',
    'payment_status',  // MAKE SURE THIS IS HERE
    'down_payment_percentage',
    'down_payment_amount',
    'remaining_balance',
    'shipping_address',
    'paymongo_payment_id',
    'paymongo_checkout_url',
    'payment_expires_at',
];

    protected $casts = [
    'total_price' => 'decimal:2',
    'shipping_cost' => 'decimal:2',
    'down_payment_amount' => 'decimal:2',
    'remaining_balance' => 'decimal:2',
    'shipping_address' => 'array',
];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Payment status constants
const PAYMENT_PENDING = 'pending';
const PAYMENT_PENDING_PAYMENT = 'pending_payment';
const PAYMENT_PENDING_DOWNPAYMENT = 'pending_downpayment';
const PAYMENT_PARTIAL = 'partial';
const PAYMENT_PAID = 'paid';
const PAYMENT_FAILED = 'failed';
const PAYMENT_REFUNDED = 'refunded';
const PAYMENT_EXPIRED = 'expired';
}
