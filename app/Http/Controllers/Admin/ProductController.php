<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\ProductSize;
use App\Models\Attribute;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\CustomizationCategory;
use Illuminate\Http\Request;
use  App\Models\Category;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
public function index()
{
    $products = Product::with(['images', 'inventory', 'sizes', 'category']) // sizes is included
        ->latest()
        ->paginate(10)
        ->through(function ($product) {
            $product->first_image_url = $product->images->isNotEmpty()
                ? asset('storage/' . $product->images->first()->image_path)
                : null;
            return $product;
        });

    return Inertia::render('Admin/Products/Index', [
        'products' => $products
    ]);
}

public function create()
{
    $categories = Category::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    $customizationCategories = CustomizationCategory::with(['options' => function($query) {
        $query->with('material'); // Load material relationship
    }])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    return Inertia::render('Admin/Products/Create', [
        'categories' => $categories,
        'customizationCategories' => $customizationCategories,
    ]);
}

    /**
     * Store a newly created product in storage.
     */

public function store(Request $request)
{
    try {
        // First, get the customizations data
        $customizationsData = $request->input('customizations');

        // If it's a JSON string, decode it
        if (is_string($customizationsData)) {
            $customizationsData = json_decode($customizationsData, true);
        }

        // Now validate (remove customizations from validation rules)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'size_unit' => 'string|in:cm,inches,mm',
            'sizes' => 'nullable|array',
            'sizes.*.size' => 'required_with:sizes|string',
            'sizes.*.size_type' => 'required_with:sizes|string|in:cm,inches,mm',
            'sizes.*.additional_price' => 'numeric|min:0',
            'sizes.*.stock' => 'integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Create product
        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'base_price' => $validated['base_price'],
            'size_unit' => $validated['size_unit'] ?? 'cm',
            'category_id' => $validated['category_id'],
        ]);

        // Handle sizes
        if (!empty($validated['sizes'])) {
            foreach ($validated['sizes'] as $sizeData) {
                if (!empty($sizeData['size'])) {
                    ProductSize::create([
                        'product_id' => $product->id,
                        'size' => $sizeData['size'],
                        'size_type' => $sizeData['size_type'] ?? 'cm',
                        'additional_price' => $sizeData['additional_price'] ?? 0,
                        'stock' => $sizeData['stock'] ?? 0,
                    ]);
                }
            }
        } else {
            Inventory::create([
                'product_id' => $product->id,
                'stock' => $validated['stock'],
            ]);
        }

        // Handle images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        // Store customizations - filter out empty categories
        if (!empty($customizationsData) && is_array($customizationsData)) {
            $filteredCustomizations = array_filter($customizationsData, function($options) {
                if (empty($options)) return false;
                // Check if any option is selected
                foreach ($options as $option) {
                    if (isset($option['selected']) && $option['selected'] === true) {
                        return true;
                    }
                }
                return false;
            });

            // Also filter out selected:false options within each category
            foreach ($filteredCustomizations as $categoryId => $options) {
                $filteredCustomizations[$categoryId] = array_filter($options, function($option) {
                    return isset($option['selected']) && $option['selected'] === true;
                });
                // Reindex array
                $filteredCustomizations[$categoryId] = array_values($filteredCustomizations[$categoryId]);
            }

            $product->customizations = $filteredCustomizations;
            $product->save();
        }

        // ==========================================
        // SAVE CUSTOMIZATION IMAGES - PUT THIS HERE
        // ==========================================
        if ($request->hasFile('customization_images')) {
            foreach ($request->file('customization_images') as $optionId => $image) {
                $path = $image->store('product-customizations', 'public');

                // Create or update the customization image record
                \App\Models\ProductCustomizationImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'customization_option_id' => $optionId,
                    ],
                    ['image_path' => $path]
                );
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product created successfully.');

    } catch (\Exception $e) {
        \Log::error('Product creation failed: ' . $e->getMessage());
        \Log::error('Request data: ' . json_encode($request->all()));
        return redirect()->back()
            ->withInput()
            ->with('error', 'Failed to create product: ' . $e->getMessage());
    }
}

    /**
     * Show the form for editing the specified product.
     */
  public function edit(Product $product)
{
    $product->load(['images', 'inventory', 'sizes']);

    $categories = \App\Models\Category::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    $customizationCategories = CustomizationCategory::with(['options' => function($query) {
        $query->with('material')->where('is_active', true);
    }])
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    // Get only the customizations that were actually selected for this product
    $selectedCustomizations = $product->customizations ?? [];

    return Inertia::render('Admin/Products/Edit', [
        'product' => $product,
        'categories' => $categories,
        'customizationCategories' => $customizationCategories,
        'selectedCustomizations' => $selectedCustomizations, // Don't add empty categories
    ]);
}

    /**
     * Update the specified product in storage.
     */
 public function update(Request $request, Product $product)
{
    try {
        // Get customizations data first (it's a JSON string)
        $customizationsData = $request->input('customizations');

        // Decode if it's a string
        if (is_string($customizationsData)) {
            $customizationsData = json_decode($customizationsData, true);
        }

        // Validate - remove customizations from validation
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'size_unit' => 'string|in:cm,inches,mm',
            'sizes' => 'nullable|array',
            'sizes.*.id' => 'nullable|exists:product_sizes,id',
            'sizes.*.size' => 'required_with:sizes|string',
            'sizes.*.size_type' => 'required_with:sizes|string|in:cm,inches,mm',
            'sizes.*.additional_price' => 'numeric|min:0',
            'sizes.*.stock' => 'integer|min:0',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            // 'customizations' removed from validation
        ]);

        // Update product basic info
        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'base_price' => $validated['base_price'],
            'size_unit' => $validated['size_unit'] ?? 'cm',
            'category_id' => $validated['category_id'],
        ]);

        // Sync sizes (keep your existing code)
        $existingSizeIds = $product->sizes->pluck('id')->toArray();
        $updatedSizeIds = [];

        if (!empty($validated['sizes'])) {
            foreach ($validated['sizes'] as $sizeData) {
                if (isset($sizeData['id'])) {
                    $size = ProductSize::find($sizeData['id']);
                    if ($size) {
                        $size->update([
                            'size' => $sizeData['size'],
                            'size_type' => $sizeData['size_type'] ?? 'cm',
                            'additional_price' => $sizeData['additional_price'] ?? 0,
                            'stock' => $sizeData['stock'] ?? 0,
                        ]);
                        $updatedSizeIds[] = $sizeData['id'];
                    }
                } else {
                    $newSize = ProductSize::create([
                        'product_id' => $product->id,
                        'size' => $sizeData['size'],
                        'size_type' => $sizeData['size_type'] ?? 'cm',
                        'additional_price' => $sizeData['additional_price'] ?? 0,
                        'stock' => $sizeData['stock'] ?? 0,
                    ]);
                    $updatedSizeIds[] = $newSize->id;
                }
            }
        }

        // Remove sizes that are no longer present
        $sizesToDelete = array_diff($existingSizeIds, $updatedSizeIds);
        ProductSize::whereIn('id', $sizesToDelete)->delete();

        // Handle inventory
        if (empty($validated['sizes']) || count($validated['sizes']) === 0) {
            $product->inventory()->updateOrCreate(
                ['product_id' => $product->id],
                ['stock' => $validated['stock']]
            );
        } else {
            $product->inventory()->delete();
        }

        // Handle new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        // Store customizations - filter to only include selected options
        if (!empty($customizationsData) && is_array($customizationsData)) {
            $filteredCustomizations = [];
            foreach ($customizationsData as $categoryId => $options) {
                // Only keep options that are selected
                $selectedOptions = array_filter($options, function($option) {
                    return isset($option['selected']) && $option['selected'] === true;
                });
                if (!empty($selectedOptions)) {
                    $filteredCustomizations[$categoryId] = array_values($selectedOptions);
                }
            }
            $product->customizations = $filteredCustomizations;
        } else {
            $product->customizations = null;
        }
        $product->save();

        // Save customization images
        if ($request->hasFile('customization_images')) {
            foreach ($request->file('customization_images') as $optionId => $image) {
                $path = $image->store('product-customizations', 'public');

                // Delete old image if exists
                $existingImage = \App\Models\ProductCustomizationImage::where('product_id', $product->id)
                    ->where('customization_option_id', $optionId)
                    ->first();

                if ($existingImage && $existingImage->image_path) {
                    \Storage::disk('public')->delete($existingImage->image_path);
                }

                // Create or update the customization image record
                \App\Models\ProductCustomizationImage::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'customization_option_id' => $optionId,
                    ],
                    ['image_path' => $path]
                );
            }
        }

        return redirect()->route('admin.products.index')
            ->with('success', 'Product updated successfully.');

    } catch (\Exception $e) {
        \Log::error('Product update failed: ' . $e->getMessage());
        return redirect()->back()
            ->withInput()
            ->with('error', 'Failed to update product: ' . $e->getMessage());
    }
}


    /**
     * Remove the specified product from storage.
     */
  public function destroy(Product $product)
{
    try {
        \Log::info('Attempting to delete product ID: ' . $product->id);
        $product->delete();
        \Log::info('Product deleted successfully');
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    } catch (\Exception $e) {
        \Log::error('Delete failed: ' . $e->getMessage());
        return redirect()->route('admin.products.index')->with('error', 'Failed to delete product.');
    }
}





/**
 * Add a new image to a product (for replacement)
 */
public function addImage(Request $request, Product $product)
{
    try {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $path = $request->file('image')->store('products', 'public');
        $product->images()->create(['image_path' => $path]);

        // Return back with success message instead of JSON
        return redirect()->back()->with('success', 'Image added successfully.');

    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Failed to add image: ' . $e->getMessage());
    }
}

/**
 * Delete an image from a product
 */
public function deleteImage($imageId)
{
    try {
        $image = \App\Models\ProductImage::findOrFail($imageId);
        $image->delete();

        return redirect()->back()->with('success', 'Image deleted successfully.');

    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Failed to delete image: ' . $e->getMessage());
    }
}

}
