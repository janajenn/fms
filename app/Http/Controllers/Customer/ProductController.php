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
    $products = Product::with(['images', 'inventory', 'sizes', 'category', 'availableCustomizationOptions.material'])
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
            // Get customization images
            $customizationImages = DB::table('product_customization_images')
                ->where('product_id', $product->id)
                ->get()
                ->keyBy('customization_option_id');

            // Build available customizations from relationship only
            $availableCustomizations = [];

            foreach ($product->availableCustomizationOptions as $option) {
                $categoryId = $option->category_id;
                if (!isset($availableCustomizations[$categoryId])) {
                    $availableCustomizations[$categoryId] = [];
                }

                $optionData = [
                    'id' => $option->id,
                    'name' => $option->name,
                    'price_modifier' => $option->price_modifier,
                    'selected' => false,
                    'color_code' => $option->color_code,
                ];

                if (isset($customizationImages[$option->id])) {
                    $optionData['preview_image_url'] = asset('storage/' . $customizationImages[$option->id]->image_path);
                }

                $availableCustomizations[$categoryId][] = $optionData;
            }
           \Log::info('Product ID: ' . $product->id);
    \Log::info('Customizations sent: ' . json_encode($availableCustomizations));

    $product->setAttribute('customizations', $availableCustomizations);
    $product->setAttribute('customization_options', $availableCustomizations);

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
    $product->load(['images', 'inventory', 'sizes', 'category', 'availableCustomizationOptions.material']);

    // Get customization images for this product
    $customizationImages = DB::table('product_customization_images')
        ->where('product_id', $product->id)
        ->get()
        ->keyBy('customization_option_id');

    // Build available customizations (NOT pre-selected)
    $availableCustomizations = [];
    foreach ($product->availableCustomizationOptions as $option) {
        $categoryId = $option->category_id;
        if (!isset($availableCustomizations[$categoryId])) {
            $availableCustomizations[$categoryId] = [];
        }

        $optionData = [
            'id' => $option->id,
            'name' => $option->name,
            'price_modifier' => $option->price_modifier,
            'selected' => false, // IMPORTANT: Customer hasn't selected anything
            'color_code' => $option->color_code,
        ];

        if (isset($customizationImages[$option->id])) {
            $optionData['preview_image_url'] = asset('storage/' . $customizationImages[$option->id]->image_path);
        }

        if ($option->material) {
            $optionData['material_stock'] = $option->material->stock;
            $optionData['quantity_used'] = $option->quantity_used;
        }

        $availableCustomizations[$categoryId][] = $optionData;
    }

    $product->customizations = $availableCustomizations;
    $product->customization_options = $availableCustomizations;

    return Inertia::render('Customer/Products/Show', [
        'product' => $product
    ]);
}
}
