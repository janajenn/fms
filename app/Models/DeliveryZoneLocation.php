<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZoneLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_zone_id',
        'location_type',
        'location_name',
        'parent_city',
        'latitude',
        'longitude',
        'place_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'place_id' => 'string',
    ];

    public function zone()
    {
        return $this->belongsTo(DeliveryZone::class, 'delivery_zone_id');
    }
}
