<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouteService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openrouteservice.org/v2';

    public function __construct()
    {
        $this->apiKey = env('OPENROUTE_API_KEY');

        if (!$this->apiKey) {
            Log::error('OpenRouteService: API key is missing!');
        } else {
            Log::info('OpenRouteService: API key found', ['key_prefix' => substr($this->apiKey, 0, 10) . '...']);
        }
    }

    public function getRoute($startLat, $startLng, $endLat, $endLng, $profile = 'driving-car')
    {
        $cacheKey = "route_{$startLat}_{$startLng}_{$endLat}_{$endLng}_{$profile}";

        return Cache::remember($cacheKey, 60 * 24 * 30, function () use ($startLat, $startLng, $endLat, $endLng, $profile) {
            try {
                // OpenRouteService expects coordinates as [longitude, latitude]
                $coordinates = [
                    [(float)$startLng, (float)$startLat],
                    [(float)$endLng, (float)$endLat]
                ];

                Log::info('Calling OpenRouteService API', [
                    'url' => "{$this->baseUrl}/directions/{$profile}/geojson",
                    'coordinates' => $coordinates
                ]);

                // IMPORTANT: The correct endpoint is /geojson, not /json
                $response = Http::withHeaders([
                    'Authorization' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])->post("{$this->baseUrl}/directions/{$profile}/geojson", [
                    'coordinates' => $coordinates
                ]);

                Log::info('OpenRouteService Response Status', ['status' => $response->status()]);

                if ($response->status() === 401) {
                    Log::error('OpenRouteService: Invalid API key. Please check your OPENROUTE_API_KEY in .env');
                    return $this->getFallbackRoute($startLat, $startLng, $endLat, $endLng);
                }

                if ($response->status() === 429) {
                    Log::error('OpenRouteService: Rate limit exceeded');
                    return $this->getFallbackRoute($startLat, $startLng, $endLat, $endLng);
                }

                if ($response->successful()) {
                    $data = $response->json();

                    if (isset($data['features'][0])) {
                        $route = $data['features'][0];
                        $geometry = $route['geometry']['coordinates'] ?? [];
                        $distance = $route['properties']['segments'][0]['distance'] ?? 0;
                        $duration = $route['properties']['segments'][0]['duration'] ?? 0;

                        Log::info('Route found successfully', [
                            'distance' => $distance,
                            'duration' => $duration,
                            'points' => count($geometry),
                            'is_fallback' => false
                        ]);

                        return [
                            'success' => true,
                            'geometry' => $geometry,
                            'distance' => $distance,
                            'duration' => $duration,
                            'distance_km' => round($distance / 1000, 2),
                            'duration_min' => round($duration / 60),
                            'is_fallback' => false,
                        ];
                    }
                }

                Log::error('OpenRouteService API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return $this->getFallbackRoute($startLat, $startLng, $endLat, $endLng);

            } catch (\Exception $e) {
                Log::error('OpenRouteService Exception: ' . $e->getMessage());
                return $this->getFallbackRoute($startLat, $startLng, $endLat, $endLng);
            }
        });
    }

    protected function getFallbackRoute($lat1, $lon1, $lat2, $lon2)
    {
        $distance = $this->calculateDistance($lat1, $lon1, $lat2, $lon2);

        Log::info('Using fallback route (straight line)', [
            'distance' => $distance,
            'is_fallback' => true
        ]);

        return [
            'success' => true,
            'geometry' => [[$lon1, $lat1], [$lon2, $lat2]],
            'distance' => $distance,
            'duration' => ($distance / 1000) * 120,
            'distance_km' => round($distance / 1000, 2),
            'duration_min' => round((($distance / 1000) * 120) / 60),
            'is_fallback' => true,
        ];
    }

    protected function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
