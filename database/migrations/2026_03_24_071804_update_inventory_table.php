<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory', function (Blueprint $table) {
            $table->string('sku')->nullable()->unique()->after('product_id');
            $table->integer('minimum_stock')->default(5)->after('stock');
            $table->integer('maximum_stock')->nullable()->after('minimum_stock');
            $table->string('location')->nullable()->after('maximum_stock');
            $table->string('supplier')->nullable()->after('location');
            $table->date('last_restock_date')->nullable()->after('supplier');
        });
    }

    public function down(): void
    {
        Schema::table('inventory', function (Blueprint $table) {
            $table->dropColumn(['sku', 'minimum_stock', 'maximum_stock', 'location', 'supplier', 'last_restock_date']);
        });
    }
};
