<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomizationOption;
use App\Models\CustomizationCategory;
use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomizationOptionController extends Controller
{
    public function index()
    {
        $options = CustomizationOption::with(['category', 'material'])
            ->orderBy('category_id')
            ->paginate(20);

        $categories = CustomizationCategory::where('is_active', true)->get();
        $materials = Material::where('is_active', true)->get();

        return Inertia::render('Admin/CustomizationOptions/Index', [
            'options' => $options,
            'categories' => $categories,
            'materials' => $materials,
        ]);
    }

   // app/Http/Controllers/Admin/CustomizationOptionController.php

public function store(Request $request)
{
    $validated = $request->validate([
        'category_id' => 'required|exists:customization_categories,id',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'price_modifier' => 'numeric|min:0',
        'material_id' => 'nullable|exists:materials,id',
        'quantity_used' => 'numeric|min:0',
        'color_code' => 'nullable|string',
        'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        'is_active' => 'boolean',
    ]);

    // Handle image upload
    if ($request->hasFile('preview_image')) {
        $path = $request->file('preview_image')->store('customization-previews', 'public');
        $validated['preview_image'] = $path;
    }

    CustomizationOption::create($validated);

    return redirect()->back()->with('success', 'Customization option created successfully.');
}

public function update(Request $request, CustomizationOption $option)
{
    $validated = $request->validate([
        'category_id' => 'required|exists:customization_categories,id',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'price_modifier' => 'numeric|min:0',
        'material_id' => 'nullable|exists:materials,id',
        'quantity_used' => 'numeric|min:0',
        'color_code' => 'nullable|string',
        'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        'is_active' => 'boolean',
    ]);

    // Handle image upload
    if ($request->hasFile('preview_image')) {
        // Delete old image if exists
        if ($option->preview_image) {
            \Storage::disk('public')->delete($option->preview_image);
        }
        $path = $request->file('preview_image')->store('customization-previews', 'public');
        $validated['preview_image'] = $path;
    }

    $option->update($validated);

    return redirect()->back()->with('success', 'Customization option updated successfully.');
}
}
