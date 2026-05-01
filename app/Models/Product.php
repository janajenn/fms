<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'base_price',
        'available_sizes',
        'size_unit',
        'customizations',
        'category_id',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'available_sizes' => 'array',
        'customizations' => 'array',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function attributeValues()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values')
                    ->withTimestamps();
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class);
    }

    public function sizes()
    {
        return $this->hasMany(ProductSize::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getFirstImageAttribute()
    {
        return $this->images->first();
    }

    public function getFirstImageUrlAttribute()
    {
        return $this->images->isNotEmpty() ? asset('storage/' . $this->images->first()->image_path) : null;
    }

    // These methods should be INSIDE the class
    public function customizationImages()
    {
        return $this->hasMany(ProductCustomizationImage::class);
    }

    public function getCustomizationImage($optionId)
    {
        $image = $this->customizationImages()->where('customization_option_id', $optionId)->first();
        return $image ? $image->image_path : null;
    }

public function availableCustomizationOptions()
{
    return $this->belongsToMany(CustomizationOption::class, 'product_customization_option')
                ->withPivot('is_available', 'sort_order')
                ->withTimestamps();
}
}
