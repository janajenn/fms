<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Inventory;
use App\Models\ProductSize;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StockController extends Controller
{
    public function index()
{
    // Get all products with their inventory or sizes
    $products = Product::with(['inventory', 'sizes', 'category'])
        ->orderBy('name')
        ->paginate(20)
        ->through(function ($product) {
            // Determine stock status based on whether product has sizes or not
            if ($product->sizes && $product->sizes->count() > 0) {
                $totalStock = $product->sizes->sum('stock');
                $product->stock_status = $this->getStockStatus($totalStock);
                $product->current_stock = $totalStock;
                $product->stock_type = 'sizes';
            } else {
                $product->stock_status = $product->inventory?->stock_status;
                $product->current_stock = $product->inventory?->stock ?? 0;
                $product->stock_type = 'simple';
            }
            return $product;
        });

    // Calculate stats (only for simple products or combined stock)
    $lowStockCount = Inventory::where('stock', '<=', DB::raw('minimum_stock'))->count();
    $outOfStockCount = Inventory::where('stock', '<=', 0)->count();

    // For products with sizes, check each size
    $productsWithSizes = Product::has('sizes')->with('sizes')->get();
    foreach ($productsWithSizes as $product) {
        foreach ($product->sizes as $size) {
            if ($size->stock <= 0) {
                $outOfStockCount++;
            } elseif ($size->stock <= 5) { // Default low stock threshold for sizes
                $lowStockCount++;
            }
        }
    }

    // FIXED: Only include inventory records where product still exists
    $totalValue = Inventory::with('product')
        ->whereHas('product', function($query) {
            $query->whereNotNull('id');
        })
        ->get()
        ->sum(function ($item) {
            // Safety check - skip if product is null
            if (!$item->product) {
                return 0;
            }
            return $item->stock * $item->product->base_price;
        });

    return Inertia::render('Admin/Stock/Index', [
        'products' => $products,
        'stats' => [
            'total_products' => $products->total(),
            'low_stock' => $lowStockCount,
            'out_of_stock' => $outOfStockCount,
            'total_value' => $totalValue,
        ],
    ]);
}

    public function stockIn(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'size_id' => 'nullable|exists:product_sizes,id', // For size-specific stock
            'reason' => 'nullable|string',
        ]);

        // Check if product has sizes
        if ($product->sizes && $product->sizes->count() > 0) {
            // Product has size variations - update specific size
            if (!$validated['size_id']) {
                return redirect()->back()->with('error', 'Please select a size to add stock.');
            }

            $size = ProductSize::find($validated['size_id']);
            if (!$size) {
                return redirect()->back()->with('error', 'Size not found.');
            }

            DB::transaction(function () use ($product, $size, $validated) {
                $stockBefore = $size->stock;
                $stockAfter = $stockBefore + $validated['quantity'];

                $size->update(['stock' => $stockAfter]);

                // Create log with size reference
                StockLog::create([
                    'product_id' => $product->id,
                    'size_id' => $size->id,
                    'size_label' => $size->size,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => $validated['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reason' => $validated['reason'],
                ]);
            });

            return redirect()->back()->with('success', "Stock added to {$size->size} successfully.");

        } else {
            // Simple product - update inventory
            $inventory = $product->inventory;

            if (!$inventory) {
                return redirect()->back()->with('error', 'Inventory record not found.');
            }

            DB::transaction(function () use ($product, $inventory, $validated) {
                $stockBefore = $inventory->stock;
                $stockAfter = $stockBefore + $validated['quantity'];

                $inventory->update([
                    'stock' => $stockAfter,
                    'last_restock_date' => now(),
                ]);

                StockLog::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id(),
                    'type' => 'in',
                    'quantity' => $validated['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reason' => $validated['reason'],
                ]);
            });

            return redirect()->back()->with('success', 'Stock added successfully.');
        }
    }

    public function stockOut(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'size_id' => 'nullable|exists:product_sizes,id',
            'reason' => 'nullable|string',
        ]);

        // Check if product has sizes
        if ($product->sizes && $product->sizes->count() > 0) {
            // Product has size variations - update specific size
            if (!$validated['size_id']) {
                return redirect()->back()->with('error', 'Please select a size to remove stock.');
            }

            $size = ProductSize::find($validated['size_id']);
            if (!$size) {
                return redirect()->back()->with('error', 'Size not found.');
            }

            if ($size->stock < $validated['quantity']) {
                return redirect()->back()->with('error', "Insufficient stock for {$size->size}. Available: {$size->stock}");
            }

            DB::transaction(function () use ($product, $size, $validated) {
                $stockBefore = $size->stock;
                $stockAfter = $stockBefore - $validated['quantity'];

                $size->update(['stock' => $stockAfter]);

                StockLog::create([
                    'product_id' => $product->id,
                    'size_id' => $size->id,
                    'size_label' => $size->size,
                    'user_id' => auth()->id(),
                    'type' => 'out',
                    'quantity' => $validated['quantity'],
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reason' => $validated['reason'],
                ]);
            });

            return redirect()->back()->with('success', "Stock removed from {$size->size} successfully.");

        } else {
            // Simple product - update inventory
            $inventory = $product->inventory;

            if (!$inventory) {
                return redirect()->back()->with('error', 'Inventory record not found.');
            }

            if ($inventory->stock < $validated['quantity']) {
                return redirect()->back()->with('error', 'Insufficient stock.');
            }

            DB::transaction(function () use ($product, $inventory, $validated) {
                $stockBefore = $inventory->stock;
                $stockAfter = $stockBefore - $validated['quantity'];

                $inventory->update(['stock' => $stockAfter]);

                StockLog::create([
                    'product_id' => $product->id,
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
    }

    public function updateAlert(Request $request, Product $product)
    {
        $validated = $request->validate([
            'minimum_stock' => 'required|integer|min:0',
            'size_id' => 'nullable|exists:product_sizes,id',
        ]);

        // Check if product has sizes
        if ($product->sizes && $product->sizes->count() > 0) {
            // Update alert for specific size (store in metadata or separate field)
            if ($validated['size_id']) {
                $size = ProductSize::find($validated['size_id']);
                if ($size) {
                    // You can add a minimum_stock field to product_sizes table, or store in metadata
                    $size->update(['minimum_stock' => $validated['minimum_stock']]);
                    return redirect()->back()->with('success', "Alert level updated for {$size->size}.");
                }
            }
            return redirect()->back()->with('error', 'Please select a size to update alert level.');
        } else {
            // Simple product - update inventory alert level
            $product->inventory()->update([
                'minimum_stock' => $validated['minimum_stock'],
            ]);
            return redirect()->back()->with('success', 'Stock alert level updated.');
        }
    }

    public function logs()
    {
        $logs = StockLog::with(['product', 'user'])
            ->latest()
            ->paginate(50);

        return Inertia::render('Admin/Stock/Logs', [
            'logs' => $logs,
        ]);
    }

    public function getLowStock()
    {
        // Get simple products with low stock
        $lowStockProducts = Product::with(['inventory', 'category'])
            ->whereHas('inventory', function ($query) {
                $query->where('stock', '<=', DB::raw('minimum_stock'))
                    ->where('stock', '>', 0);
            })
            ->get();

        // Get products with sizes that have low stock
        $lowStockSizes = Product::with(['sizes', 'category'])
            ->whereHas('sizes', function ($query) {
                $query->where('stock', '<=', 5) // Default threshold
                    ->where('stock', '>', 0);
            })
            ->get();

        return response()->json([
            'simple_products' => $lowStockProducts,
            'size_variants' => $lowStockSizes,
        ]);
    }

    public function getOutOfStock()
    {
        // Get simple products out of stock
        $outOfStockProducts = Product::with(['inventory', 'category'])
            ->whereHas('inventory', function ($query) {
                $query->where('stock', '<=', 0);
            })
            ->get();

        // Get products with sizes that have out of stock variants
        $outOfStockSizes = Product::with(['sizes', 'category'])
            ->whereHas('sizes', function ($query) {
                $query->where('stock', '<=', 0);
            })
            ->get();

        return response()->json([
            'simple_products' => $outOfStockProducts,
            'size_variants' => $outOfStockSizes,
        ]);
    }

    private function getStockStatus($stock)
    {
        if ($stock <= 0) {
            return ['status' => 'out_of_stock', 'label' => 'Out of Stock', 'color' => 'red'];
        } elseif ($stock <= 5) {
            return ['status' => 'low_stock', 'label' => 'Low Stock', 'color' => 'yellow'];
        } else {
            return ['status' => 'in_stock', 'label' => 'In Stock', 'color' => 'green'];
        }
    }
}
