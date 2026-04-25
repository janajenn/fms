<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\MaterialStockLog;
use Illuminate\Http\Request;
use App\Models\CustomizationOption;
use App\Models\Supplier;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MaterialController extends Controller
{
    public function index()
    {
        $materials = Material::orderBy('name')
            ->paginate(20);

        $lowStockCount = Material::where('stock', '<=', DB::raw('minimum_stock'))->count();
        $outOfStockCount = Material::where('stock', '<=', 0)->count();
        $totalValue = Material::sum(DB::raw('stock * cost_per_unit'));

        return Inertia::render('Admin/Materials/Index', [
            'materials' => $materials,
            'stats' => [
                'total_materials' => $materials->total(),
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
                'total_value' => $totalValue,
            ],
        ]);
    }

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:materials',
        'unit' => 'required|string',
        'stock' => 'required|numeric|min:0',
        'minimum_stock' => 'required|numeric|min:0',
        'supplier_id' => 'nullable|exists:suppliers,id',
        'cost_per_unit' => 'nullable|numeric|min:0',
        'description' => 'nullable|string',
    ]);

    $material = Material::create($validated);

    // Create initial stock log
    MaterialStockLog::create([
        'material_id' => $material->id,
        'user_id' => auth()->id(),
        'type' => 'in',
        'quantity' => $validated['stock'],
        'stock_before' => 0,
        'stock_after' => $validated['stock'],
        'reason' => 'Initial stock',
    ]);

    return redirect()->back()->with('success', 'Material created successfully.');
}

public function update(Request $request, Material $material)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:materials,name,' . $material->id,
        'unit' => 'required|string',
        'stock' => 'required|numeric|min:0',  // ✅ Add this line
        'minimum_stock' => 'required|numeric|min:0',
        'supplier_id' => 'nullable|exists:suppliers,id',
        'cost_per_unit' => 'nullable|numeric|min:0',
        'description' => 'nullable|string',
        'is_active' => 'boolean',
    ]);

    $material->update($validated);

    return redirect()->back()->with('success', 'Material updated successfully.');
}

    public function stockIn(Request $request, Material $material)
{
    \Log::info('Stock In called', [
        'material_id' => $material->id,
        'quantity' => $request->quantity,
        'current_stock' => $material->stock
    ]);

    $validated = $request->validate([
        'quantity' => 'required|numeric|min:0.01',
        'reason' => 'nullable|string',
    ]);

    DB::transaction(function () use ($material, $validated) {
        $stockBefore = $material->stock;
        $stockAfter = $stockBefore + $validated['quantity'];

        $material->update(['stock' => $stockAfter]);

        $log = MaterialStockLog::create([
            'material_id' => $material->id,
            'user_id' => auth()->id(),
            'type' => 'in',
            'quantity' => $validated['quantity'],
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'reason' => $validated['reason'],
        ]);

        \Log::info('Stock log created', ['log_id' => $log->id]);
    });

    return redirect()->back()->with('success', 'Stock added successfully.');
}

    public function stockOut(Request $request, Material $material)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'nullable|string',
        ]);

        if ($material->stock < $validated['quantity']) {
            return redirect()->back()->with('error', 'Insufficient stock.');
        }

        DB::transaction(function () use ($material, $validated) {
            $stockBefore = $material->stock;
            $stockAfter = $stockBefore - $validated['quantity'];

            $material->update(['stock' => $stockAfter]);

            MaterialStockLog::create([
                'material_id' => $material->id,
                'user_id' => auth()->id(),
                'type' => 'out',
                'quantity' => $validated['quantity'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'reason' => $validated['reason'],
            ]);
        });

        return redirect()->back()->with('success', 'Stock removed successfully.');
    }

    public function logs()
    {
        $logs = MaterialStockLog::with(['material', 'user'])
            ->latest()
            ->paginate(50);

        return Inertia::render('Admin/Materials/Logs', [
            'logs' => $logs,
        ]);
    }

public function destroy(Material $material)
{
    try {
        // Soft delete the material
        $material->delete();

        return redirect()->back()->with('success', 'Material moved to archive successfully.');
    } catch (\Exception $e) {
        \Log::error('Material deletion failed: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to archive material: ' . $e->getMessage());
    }
}

public function archived()
{
    $materials = Material::onlyTrashed()
        ->with('supplier')
        ->orderBy('deleted_at', 'desc')
        ->paginate(20);

    return Inertia::render('Admin/Materials/Archived', [
        'materials' => $materials,
    ]);
}

public function restore($id)
{
    try {
        $material = Material::onlyTrashed()->findOrFail($id);
        $material->restore();

        return redirect()->back()->with('success', 'Material restored successfully.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Failed to restore material.');
    }
}

public function forceDelete($id)
{
    try {
        $material = Material::onlyTrashed()->findOrFail($id);

        // Check if material has linked customization options
        if ($material->customizationOptions()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot permanently delete material with linked customization options.');
        }

        $material->forceDelete();

        return redirect()->back()->with('success', 'Material permanently deleted.');
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Failed to permanently delete material.');
    }
}

public function getLinkedOptions(Material $material)
{
    try {
        $options = $material->customizationOptions()->with('category')->get()->map(function($option) {
            return [
                'id' => $option->id,
                'name' => $option->name,
                'category_name' => $option->category->name ?? 'Unknown',
            ];
        });

        // Return a JSON response that Inertia can handle
        return response()->json([
            'linkedOptions' => $options
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'linkedOptions' => [],
            'error' => $e->getMessage()
        ], 500);
    }
}


}
