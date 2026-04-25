<?php
// database/seeders/AttributeSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attribute;
use App\Models\AttributeValue;

class AttributeSeeder extends Seeder
{
    public function run(): void
    {
        // Create Color attribute
        $color = Attribute::create(['name' => 'Color']);
        $colorValues = ['Red', 'Blue', 'Green', 'Black', 'White', 'Brown'];

        foreach ($colorValues as $value) {
            AttributeValue::create([
                'attribute_id' => $color->id,
                'value' => $value
            ]);
        }

        // Create Material attribute
        $material = Attribute::create(['name' => 'Material']);
        $materialValues = ['Wood', 'Metal', 'Leather', 'Fabric', 'Glass'];

        foreach ($materialValues as $value) {
            AttributeValue::create([
                'attribute_id' => $material->id,
                'value' => $value
            ]);
        }

        // Create Size attribute
        $size = Attribute::create(['name' => 'Size']);
        $sizeValues = ['Small', 'Medium', 'Large', 'Extra Large'];

        foreach ($sizeValues as $value) {
            AttributeValue::create([
                'attribute_id' => $size->id,
                'value' => $value
            ]);
        }
    }
}
