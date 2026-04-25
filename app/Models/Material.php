<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Material extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'unit',
        'stock',
        'minimum_stock',
        'supplier_id',
        'cost_per_unit',
        'description',
        'is_active',
    ];

    protected $casts = [
        'stock' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($material) {
            $material->slug = Str::slug($material->name);
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function customizationOptions()
    {
        return $this->hasMany(CustomizationOption::class);
    }

    public function stockLogs()
    {
        return $this->hasMany(MaterialStockLog::class);
    }

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
