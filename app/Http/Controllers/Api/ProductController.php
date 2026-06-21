<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('images')->paginate(20);

        // Transform each product for mobile
        $products->getCollection()->transform(function ($product) {
            return $this->formatProduct($product);
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with('images', 'sizes')->findOrFail($id);
        return response()->json($this->formatProduct($product));
    }

    private function formatProduct($product)
    {
        // Determine the primary image URL
        $imageUrl = null;
        if ($product->images && $product->images->isNotEmpty()) {
            $firstImage = $product->images->first();
            $imageUrl = $firstImage->image_path
                ? url('/storage/' . $firstImage->image_path)
                : null;
        }

        // Get price (use base_price or price column)
        $price = $product->price ?? $product->base_price ?? 0;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float) $price,
            'image_url' => $imageUrl,
            'images' => $product->images->map(function ($img) {
                return [
                    'id' => $img->id,
                    'url' => url('/storage/' . $img->image_path),
                ];
            }),
            'sizes' => $product->sizes->map(function ($size) {
                return [
                    'id' => $size->id,
                    'size' => $size->size,
                    'stock' => $size->stock,
                ];
            }),
            'customizations' => $product->availableCustomizationOptions ?? [],
        ];
    }
}
