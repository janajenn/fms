<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
   public function index(Request $request)
{
    $products = Product::with(['images', 'inventory', 'sizes', 'category'])
        ->whereHas('inventory', function($query) {
            $query->where('stock', '>', 0);
        })
        ->when($request->category, function($query, $category) {
            $query->whereHas('category', function($q) use ($category) {
                $q->where('slug', $category);
            });
        })
        ->when($request->sort, function($query, $sort) {
            if ($sort === 'price_low') {
                $query->orderBy('base_price', 'asc');
            } elseif ($sort === 'price_high') {
                $query->orderBy('base_price', 'desc');
            } else {
                $query->latest();
            }
        })
        ->latest()
        ->paginate(12)
        ->through(function ($product) {
            // Load customization images for each product
            $customizationImages = DB::table('product_customization_images')
                ->where('product_id', $product->id)
                ->get()
                ->keyBy('customization_option_id');

            $customizations = $product->customizations;
            if (is_string($customizations)) {
                $customizations = json_decode($customizations, true);
            }

            if ($customizations) {
                $enhancedCustomizations = [];
                foreach ($customizations as $categoryId => $options) {
                    $enhancedCustomizations[$categoryId] = [];
                    foreach ($options as $option) {
                        $enhancedOption = [
                            'id' => $option['id'],
                            'name' => $option['name'],
                            'price_modifier' => $option['price_modifier'],
                            'selected' => $option['selected'] ?? false,
                        ];

                        if (isset($customizationImages[$option['id']])) {
                            $enhancedOption['preview_image_url'] = asset('storage/' . $customizationImages[$option['id']]->image_path);
                        }

                        $enhancedCustomizations[$categoryId][] = $enhancedOption;
                    }
                }
                $product->customizations = $enhancedCustomizations;
            }
            $product->customization_options = $product->customizations ?? [];

            return $product;
        });

    $categories = Category::where('is_active', true)->orderBy('sort_order')->get();

    return Inertia::render('Customer/Products/Index', [
        'products' => $products,
        'categories' => $categories,
    ]);
}




    public function show(Product $product)
    {
        // Load basic product data
        $product->load(['images', 'inventory', 'sizes', 'category']);

        // Get customization images for this product
        $customizationImages = DB::table('product_customization_images')
            ->where('product_id', $product->id)
            ->get()
            ->keyBy('customization_option_id');

        // Get customizations - decode if it's a string
        $customizations = $product->customizations;

        if (is_string($customizations)) {
            $customizations = json_decode($customizations, true);
        }

        if (!$customizations) {
            $customizations = [];
        }

        // Build enhanced customizations with image URLs
        $enhancedCustomizations = [];

        foreach ($customizations as $categoryId => $options) {
            $enhancedCustomizations[$categoryId] = [];
            foreach ($options as $option) {
                $optionId = $option['id'];

                $enhancedOption = [
                    'id' => $optionId,
                    'name' => $option['name'],
                    'price_modifier' => $option['price_modifier'],
                    'selected' => $option['selected'] ?? false,
                ];

                // Add image URL if exists
                if (isset($customizationImages[$optionId])) {
                    $imagePath = $customizationImages[$optionId]->image_path;
                    $enhancedOption['preview_image_url'] = asset('storage/' . $imagePath);
                }

                $enhancedCustomizations[$categoryId][] = $enhancedOption;
            }
        }

        // Set the enhanced customizations
        $product->customizations = $enhancedCustomizations;
        $product->customization_options = $enhancedCustomizations;

        // DEBUG: Log to file to verify
        file_put_contents(storage_path('logs/debug.txt'), "Product ID: {$product->id}\n", FILE_APPEND);
        file_put_contents(storage_path('logs/debug.txt'), "Customizations: " . json_encode($enhancedCustomizations) . "\n\n", FILE_APPEND);

        return Inertia::render('Customer/Products/Show', [
            'product' => $product
        ]);
    }
}
