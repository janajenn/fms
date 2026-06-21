<?php

namespace App\Console\Commands;

use App\Models\DeliveryZoneLocation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GeocodeDeliveryZones extends Command
{
    protected $signature = 'delivery:geocode';
    protected $description = 'Geocode all delivery zone locations that have missing coordinates';

    public function handle()
    {
        $locations = DeliveryZoneLocation::whereNull('latitude')->orWhereNull('longitude')->get();

        if ($locations->isEmpty()) {
            $this->info('All locations already have coordinates.');
            return;
        }

        $this->info("Found {$locations->count()} locations without coordinates. Geocoding...");

        foreach ($locations as $location) {
            // Build search string same as admin map uses
            $search = $location->location_name;
            if ($location->parent_city) {
                $search .= ', ' . $location->parent_city;
            }
            $search .= ', Philippines';

            $this->info("Geocoding: {$search}");

            $url = "https://nominatim.openstreetmap.org/search?format=json&q=" . urlencode($search) . "&countrycodes=ph&limit=5";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'AArfeels/1.0');
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                $this->error("HTTP error {$httpCode} for {$search}");
                continue;
            }

            $data = json_decode($response, true);
            if (!empty($data)) {
                // Take first result
                $result = $data[0];
                $location->latitude = $result['lat'];
                $location->longitude = $result['lon'];
                $location->place_id = $result['place_id'];
                $location->save();
                $this->info("✓ Updated coordinates for {$location->location_name}: {$result['lat']}, {$result['lon']}");
            } else {
                $this->warn("✗ Could not geocode {$search}");
                // Log the response for debugging
                $this->info("Response: " . substr($response, 0, 200));
            }
        }

        $this->info('Done.');
    }
}
