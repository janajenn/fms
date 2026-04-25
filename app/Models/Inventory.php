<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'stock',
        'minimum_stock',
        'maximum_stock',
        'location',
        'supplier',
        'last_restock_date',
        'sku',
    ];

    protected $casts = [
        'stock' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'last_restock_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function stockLogs()
    {
        return $this->hasMany(StockLog::class, 'product_id', 'product_id');
    }

    // Get stock status
    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return ['status' => 'out_of_stock', 'label' => 'Out of Stock', 'color' => 'red'];
        } elseif ($this->stock <= $this->minimum_stock) {
            return ['status' => 'low_stock', 'label' => 'Low Stock', 'color' => 'yellow'];
        } else {
            return ['status' => 'in_stock', 'label' => 'In Stock', 'color' => 'green'];
        }
    }
}
