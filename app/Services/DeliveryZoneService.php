<?php

namespace App\Services;

use App\Models\DeliveryZone;
use App\Models\DeliveryZoneLocation;

class DeliveryZoneService
{
    /**
     * Check if a location is deliverable and get the delivery fee
     */
    /**
 * Check deliverability by barangay only
 */
public function checkDeliverabilityByBarangay($barangay)
{
    if (!$barangay) return null;

    $barangay = trim(strtolower($barangay));

    $zones = DeliveryZone::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    foreach ($zones as $zone) {
        $locations = DeliveryZoneLocation::where('delivery_zone_id', $zone->id)
            ->where('is_active', true)
            ->where('location_type', 'barangay')
            ->get();

        foreach ($locations as $location) {
            $locationName = trim(strtolower($location->location_name));

            // Check for exact match or partial match
            if ($locationName === $barangay ||
                str_contains($barangay, $locationName) ||
                str_contains($locationName, $barangay)) {
                return [
                    'zone' => $zone,
                    'fee' => (float) $zone->delivery_fee,
                    'matched_on' => 'barangay',
                    'matched_location' => $location->location_name
                ];
            }
        }
    }

    return null;
}

/**
 * Check deliverability by city or barangay
 */
public function checkDeliverability($city, $barangay = null, $lat = null, $lng = null)
{
    $zones = DeliveryZone::where('is_active', true)->orderBy('sort_order')->get();

    // 1) If coordinates available, try proximity matching (most accurate)
    if ($lat && $lng) {
        foreach ($zones as $zone) {
            $locations = DeliveryZoneLocation::where('delivery_zone_id', $zone->id)
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->get();
            foreach ($locations as $location) {
                if ($this->isWithinRadius($lat, $lng, $location->latitude, $location->longitude, 5)) {
                    return [
                        'zone' => $zone,
                        'fee' => (float) $zone->delivery_fee,
                        'matched_on' => 'proximity',
                        'matched_location' => $location->location_name
                    ];
                }
            }
        }
    }

    // 2) Fallback to string matching (original logic)
    // Assume $city, $barangay are strings
    $city = $city ? trim(strtolower($city)) : '';
    $barangay = $barangay ? trim(strtolower($barangay)) : null;

    foreach ($zones as $zone) {
        $locations = DeliveryZoneLocation::where('delivery_zone_id', $zone->id)
            ->where('is_active', true)
            ->get();

        if ($barangay) {
            foreach ($locations as $location) {
                if ($location->location_type === 'barangay') {
                    $locationName = trim(strtolower($location->location_name));
                    if ($this->normalizeLocation($locationName) === $this->normalizeLocation($barangay)) {
                        return [
                            'zone' => $zone,
                            'fee' => (float) $zone->delivery_fee,
                            'matched_on' => 'barangay',
                            'matched_location' => $location->location_name
                        ];
                    }
                }
            }
        }

        if ($city) {
            foreach ($locations as $location) {
                if ($location->location_type === 'city') {
                    $locationName = trim(strtolower($location->location_name));
                    if ($this->normalizeLocation($locationName) === $this->normalizeLocation($city)) {
                        return [
                            'zone' => $zone,
                            'fee' => (float) $zone->delivery_fee,
                            'matched_on' => 'city',
                            'matched_location' => $location->location_name
                        ];
                    }
                }
            }
        }
    }

    return null;
}



/**
 * Normalize a location string for fuzzy matching
 */
private function normalizeLocation($name)
{
    $name = strtolower(trim($name));
    // remove common suffixes like "city", "municipality", "town", "barangay"
    $name = preg_replace('/\b(city|municipality|town|barangay)\b/', '', $name);
    // remove extra spaces
    return preg_replace('/\s+/', ' ', trim($name));
}
    /**
     * Check if two location names match
     */
    private function matches($input, $stored)
    {
        // Exact match
        if ($input === $stored) {
            return true;
        }

        // Check if input is contained in stored (e.g., "opol" in "opol misamis oriental")
        if (str_contains($stored, $input)) {
            return true;
        }

        // Check if stored is contained in input
        if (str_contains($input, $stored)) {
            return true;
        }

        // Check if they share common keywords (for partial matches)
        $inputWords = explode(' ', $input);
        $storedWords = explode(' ', $stored);

        $commonWords = array_intersect($inputWords, $storedWords);
        if (count($commonWords) >= 1 && count($inputWords) <= 2) {
            return true;
        }

        return false;
    }

    /**
     * Get delivery fee for a location
     */
    public function getDeliveryFee($city, $barangay = null)
    {
        $result = $this->checkDeliverability($city, $barangay);
        return $result ? $result['fee'] : null;
    }

    /**
     * Check if location has free delivery
     */
    public function isFreeDelivery($city, $barangay = null)
    {
        $result = $this->checkDeliverability($city, $barangay);
        return $result && $result['fee'] == 0;
    }
}
