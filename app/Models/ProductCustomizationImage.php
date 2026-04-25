<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCustomizationImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'customization_option_id',
        'image_path',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function customizationOption()
    {
        return $this->belongsTo(CustomizationOption::class);
    }
}
