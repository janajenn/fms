<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'delivery_fee',
        'is_active',
        'sort_order',
        
    ];

    protected $casts = [
        'delivery_fee' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function locations()
    {
        return $this->hasMany(DeliveryZoneLocation::class);
    }

    public function requests()
    {
        return $this->hasMany(DeliveryZoneRequest::class, 'added_to_zone_id');
    }
}
