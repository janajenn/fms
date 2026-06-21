<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryZoneRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_phone',
        'requested_city',
        'requested_barangay',
        'full_address',
        'notes',
        'status',
        'latitude',
        'longitude',
        'admin_notes',
        'added_to_zone_id',
    ];

    protected $casts = [
        'status' => 'string',
        'latitude' => 'double',
        'longitude' => 'double',
    ];

    public function addedToZone()
    {
        return $this->belongsTo(DeliveryZone::class, 'added_to_zone_id');
    }
}
