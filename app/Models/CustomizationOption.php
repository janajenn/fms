<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomizationOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price_modifier',
        'color_code',
        'preview_image', // Add this
        'metadata',
        'sort_order',
        'is_active',
        'material_id',
        'quantity_used',
    ];

    protected $casts = [
        'metadata' => 'array',
        'price_modifier' => 'decimal:2',
        'quantity_used' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(CustomizationCategory::class, 'category_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
