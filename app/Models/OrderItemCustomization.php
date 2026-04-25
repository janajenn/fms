<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemCustomization extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'attribute',
        'value',
        'price_modifier',  // Add this
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
