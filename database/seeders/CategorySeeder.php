<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Dining Tables',
                'slug' => 'dining-tables',
                'description' => 'Beautiful handcrafted dining tables for family gatherings',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Chairs',
                'slug' => 'chairs',
                'description' => 'Comfortable and stylish chairs for every room',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Cabinets',
                'slug' => 'cabinets',
                'description' => 'Storage solutions that combine functionality with style',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Bed Frames',
                'slug' => 'bed-frames',
                'description' => 'Solid wood bed frames for restful sleep',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Sofas',
                'slug' => 'sofas',
                'description' => 'Comfortable seating for your living room',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Coffee Tables',
                'slug' => 'coffee-tables',
                'description' => 'Functional and stylish centerpieces for your living space',
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Desks',
                'slug' => 'desks',
                'description' => 'Workspaces that inspire productivity',
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'Bookshelves',
                'slug' => 'bookshelves',
                'description' => 'Display your collection in style',
                'sort_order' => 8,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
