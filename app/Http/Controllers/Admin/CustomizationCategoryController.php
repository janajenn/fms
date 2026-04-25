<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomizationCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CustomizationCategoryController extends Controller
{
    public function index()
    {
        $categories = CustomizationCategory::orderBy('sort_order')
            ->paginate(20);

        return Inertia::render('Admin/CustomizationCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:customization_categories',
            'slug' => 'required|string|max:255|unique:customization_categories',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        CustomizationCategory::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, CustomizationCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:customization_categories,name,' . $category->id,
            'slug' => 'required|string|max:255|unique:customization_categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }
}
