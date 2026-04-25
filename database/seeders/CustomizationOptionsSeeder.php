<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\CustomizationCategory;
use App\Models\CustomizationOption;
use App\Models\Material;

class CustomizationOptionsSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        CustomizationOption::truncate();
        CustomizationCategory::truncate();
        Material::truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // ============================================
        // CREATE MATERIALS FIRST
        // ============================================

        $materials = [
    // Wood Finishes
    ['name' => 'Natural Clear Gloss', 'slug' => 'natural-clear-gloss', 'unit' => 'liters', 'stock' => 25, 'minimum_stock' => 5],
    ['name' => 'Dark Walnut Stain', 'slug' => 'dark-walnut-stain', 'unit' => 'liters', 'stock' => 20, 'minimum_stock' => 5],
    ['name' => 'Ebony Stain', 'slug' => 'ebony-stain', 'unit' => 'liters', 'stock' => 15, 'minimum_stock' => 5],
    ['name' => 'Dark Oak Stain', 'slug' => 'dark-oak-stain', 'unit' => 'liters', 'stock' => 18, 'minimum_stock' => 5],

    // Paints
    ['name' => 'Matte Black Paint', 'slug' => 'matte-black-paint', 'unit' => 'liters', 'stock' => 30, 'minimum_stock' => 10],
    ['name' => 'White Paint', 'slug' => 'white-paint', 'unit' => 'liters', 'stock' => 25, 'minimum_stock' => 10],
    ['name' => 'Sage Green Paint', 'slug' => 'sage-green-paint', 'unit' => 'liters', 'stock' => 12, 'minimum_stock' => 5],

    // Fabrics (in meters)
    ['name' => 'Leather', 'slug' => 'leather', 'unit' => 'meters', 'stock' => 100, 'minimum_stock' => 20],
    ['name' => 'Velvet', 'slug' => 'velvet', 'unit' => 'meters', 'stock' => 80, 'minimum_stock' => 20],
    ['name' => 'Canvas', 'slug' => 'canvas', 'unit' => 'meters', 'stock' => 120, 'minimum_stock' => 30],
    ['name' => 'Cotton Linen', 'slug' => 'cotton-linen', 'unit' => 'meters', 'stock' => 90, 'minimum_stock' => 20],

    // Fabric Colors (dyes)
    ['name' => 'Royal Blue Dye', 'slug' => 'royal-blue-dye', 'unit' => 'liters', 'stock' => 15, 'minimum_stock' => 5],
    ['name' => 'Charcoal Gray Dye', 'slug' => 'charcoal-gray-dye', 'unit' => 'liters', 'stock' => 12, 'minimum_stock' => 5],
    // ... rest of colors
];

        foreach ($materials as $material) {
            Material::create($material);
        }

        // ============================================
        // CREATE CATEGORIES AND OPTIONS
        // ============================================

        // 1. Wood Finish Category
        $woodFinish = CustomizationCategory::create([
            'name' => 'Wood Finish',
            'slug' => 'wood-finish',
            'description' => 'Choose the finish that brings out the natural beauty of the wood',
            'sort_order' => 1,
        ]);

        $woodFinishOptions = [
            ['name' => 'Natural / Clear Gloss', 'description' => 'Preserves the natural wood grain with a protective clear coat', 'price_modifier' => 0, 'material_name' => 'Natural Clear Gloss', 'quantity_used' => 0.5],
            ['name' => 'Dark Walnut Stain', 'description' => 'Rich, deep brown that highlights the wood grain', 'price_modifier' => 50, 'material_name' => 'Dark Walnut Stain', 'quantity_used' => 0.5],
            ['name' => 'Ebony', 'description' => 'Sleek, dark finish for a modern, sophisticated look', 'price_modifier' => 75, 'material_name' => 'Ebony Stain', 'quantity_used' => 0.5],
            ['name' => 'Dark Oak', 'description' => 'Warm, rich oak stain with prominent grain pattern', 'price_modifier' => 50, 'material_name' => 'Dark Oak Stain', 'quantity_used' => 0.5],
        ];

        foreach ($woodFinishOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $woodFinish->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
            ]);
        }

        // 2. Paint / Solid Colors Category
        $paintColors = CustomizationCategory::create([
            'name' => 'Paint / Solid Colors',
            'slug' => 'paint-colors',
            'description' => 'Solid color finishes for a modern, uniform look',
            'sort_order' => 2,
        ]);

        $paintOptions = [
            ['name' => 'Matte Black', 'description' => 'Sleek, modern black with a non-reflective finish', 'price_modifier' => 0, 'material_name' => 'Matte Black Paint', 'color_code' => '#000000', 'quantity_used' => 0.5],
            ['name' => 'White', 'description' => 'Clean, bright white for a fresh, airy feel', 'price_modifier' => 0, 'material_name' => 'White Paint', 'color_code' => '#FFFFFF', 'quantity_used' => 0.5],
            ['name' => 'Sage Green', 'description' => 'Soft, calming green that brings nature indoors', 'price_modifier' => 25, 'material_name' => 'Sage Green Paint', 'color_code' => '#9CAF88', 'quantity_used' => 0.5],
        ];

        foreach ($paintOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $paintColors->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'color_code' => $opt['color_code'],
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
            ]);
        }

        // 3. Finish Type Category (No material link - just aesthetic)
        $finishType = CustomizationCategory::create([
            'name' => 'Finish Type',
            'slug' => 'finish-type',
            'description' => 'Choose the sheen level for your furniture',
            'sort_order' => 3,
        ]);

        $finishTypeOptions = [
            ['name' => 'Matte', 'description' => 'Non-reflective, smooth finish that hides imperfections', 'price_modifier' => 0, 'metadata' => json_encode(['sheen_level' => '0-10%'])],
            ['name' => 'Semi-Gloss', 'description' => 'Moderate sheen, durable and easy to clean', 'price_modifier' => 25, 'metadata' => json_encode(['sheen_level' => '35-45%'])],
            ['name' => 'High-Gloss', 'description' => 'High shine, reflective finish for a luxurious look', 'price_modifier' => 50, 'metadata' => json_encode(['sheen_level' => '70-85%'])],
        ];

        foreach ($finishTypeOptions as $opt) {
            $finishType->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'metadata' => $opt['metadata'],
            ]);
        }

        // 4. Fabric & Upholstery Category
        $fabric = CustomizationCategory::create([
            'name' => 'Fabric & Upholstery',
            'slug' => 'fabric',
            'description' => 'Premium fabrics for cushions, sofas, and padded furniture',
            'sort_order' => 4,
        ]);

        $fabricOptions = [
            ['name' => 'Leather', 'description' => 'Genuine leather, soft and durable with a luxurious feel', 'price_modifier' => 200, 'material_name' => 'Leather', 'quantity_used' => 2, 'metadata' => json_encode(['type' => 'premium', 'durability' => 'High', 'care' => 'Wipe clean with damp cloth'])],
            ['name' => 'Velvet', 'description' => 'Luxurious, soft fabric with a rich texture', 'price_modifier' => 150, 'material_name' => 'Velvet', 'quantity_used' => 2, 'metadata' => json_encode(['type' => 'premium', 'durability' => 'Medium', 'care' => 'Dry clean only'])],
            ['name' => 'Canvas', 'description' => 'Durable, versatile fabric perfect for everyday use', 'price_modifier' => 0, 'material_name' => 'Canvas', 'quantity_used' => 2, 'metadata' => json_encode(['type' => 'standard', 'durability' => 'High', 'care' => 'Machine washable'])],
            ['name' => 'Cotton Linen', 'description' => 'Breathable, natural fabric with a casual elegance', 'price_modifier' => 50, 'material_name' => 'Cotton Linen', 'quantity_used' => 2, 'metadata' => json_encode(['type' => 'standard', 'durability' => 'Medium', 'care' => 'Dry clean recommended'])],
        ];

        foreach ($fabricOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $fabric->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
                'metadata' => $opt['metadata'],
            ]);
        }

        // 5. Fabric Colors Category
        $fabricColors = CustomizationCategory::create([
            'name' => 'Fabric Colors',
            'slug' => 'fabric-colors',
            'description' => 'Select available fabric colors',
            'sort_order' => 5,
        ]);

        $fabricColorOptions = [
            ['name' => 'Red', 'color_code' => '#FF0000', 'material_name' => 'Red Dye', 'quantity_used' => 0.2],
            ['name' => 'Orange', 'color_code' => '#FFA500', 'material_name' => 'Orange Dye', 'quantity_used' => 0.2],
            ['name' => 'Yellow', 'color_code' => '#FFFF00', 'material_name' => 'Yellow Dye', 'quantity_used' => 0.2],
            ['name' => 'Green', 'color_code' => '#008000', 'material_name' => 'Green Dye', 'quantity_used' => 0.2],
            ['name' => 'Light Blue', 'color_code' => '#ADD8E6', 'material_name' => 'Light Blue Dye', 'quantity_used' => 0.2],
            ['name' => 'Dark Blue', 'color_code' => '#00008B', 'material_name' => 'Dark Blue Dye', 'quantity_used' => 0.2],
            ['name' => 'Purple', 'color_code' => '#800080', 'material_name' => 'Purple Dye', 'quantity_used' => 0.2],
            ['name' => 'Pink', 'color_code' => '#FFC0CB', 'material_name' => 'Pink Dye', 'quantity_used' => 0.2],
            ['name' => 'Brown', 'color_code' => '#A52A2A', 'material_name' => 'Brown Dye', 'quantity_used' => 0.2],
            ['name' => 'Beige', 'color_code' => '#F5F5DC', 'material_name' => 'Beige Dye', 'quantity_used' => 0.2],
            ['name' => 'Gray', 'color_code' => '#808080', 'material_name' => 'Gray Dye', 'quantity_used' => 0.2],
            ['name' => 'Royal Blue', 'color_code' => '#4169E1', 'material_name' => 'Royal Blue Dye', 'quantity_used' => 0.2],
            ['name' => 'Charcoal Gray', 'color_code' => '#36454F', 'material_name' => 'Charcoal Gray Dye', 'quantity_used' => 0.2],
        ];

        foreach ($fabricColorOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $fabricColors->options()->create([
                'name' => $opt['name'],
                'color_code' => $opt['color_code'],
                'price_modifier' => 0,
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
            ]);
        }

        // 6. Knobs & Handles Category
        $knobs = CustomizationCategory::create([
            'name' => 'Knobs & Handles',
            'slug' => 'knobs-handles',
            'description' => 'Choose the perfect hardware for your furniture',
            'sort_order' => 6,
        ]);

        $knobsOptions = [
            ['name' => 'Gold', 'description' => 'Elegant and premium look', 'price_modifier' => 30, 'material_name' => 'Gold Knobs', 'quantity_used' => 1, 'metadata' => json_encode(['style' => 'elegant'])],
            ['name' => 'Silver', 'description' => 'Clean and modern', 'price_modifier' => 20, 'material_name' => 'Silver Knobs', 'quantity_used' => 1, 'metadata' => json_encode(['style' => 'modern'])],
            ['name' => 'Rustic Iron', 'description' => 'Vintage or industrial style', 'price_modifier' => 25, 'material_name' => 'Rustic Iron Handles', 'quantity_used' => 1, 'metadata' => json_encode(['style' => 'vintage'])],
        ];

        foreach ($knobsOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $knobs->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
                'metadata' => $opt['metadata'],
            ]);
        }

        // 7. Leg Styles Category
        $legs = CustomizationCategory::create([
            'name' => 'Leg Styles',
            'slug' => 'leg-styles',
            'description' => 'Choose the base that complements your design',
            'sort_order' => 7,
        ]);

        $legsOptions = [
            ['name' => 'Metal Legs', 'description' => 'Industrial and modern design', 'price_modifier' => 50, 'material_name' => 'Metal Legs', 'quantity_used' => 1, 'metadata' => json_encode(['style' => 'modern'])],
            ['name' => 'Wood Legs', 'description' => 'Classic and traditional appearance', 'price_modifier' => 40, 'material_name' => 'Wood Legs', 'quantity_used' => 1, 'metadata' => json_encode(['style' => 'classic'])],
        ];

        foreach ($legsOptions as $opt) {
            $material = Material::where('name', $opt['material_name'])->first();
            $legs->options()->create([
                'name' => $opt['name'],
                'description' => $opt['description'],
                'price_modifier' => $opt['price_modifier'],
                'material_id' => $material?->id,
                'quantity_used' => $opt['quantity_used'],
                'metadata' => $opt['metadata'],
            ]);
        }
    }
}
