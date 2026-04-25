<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Add any missing columns
            if (!Schema::hasColumn('order_items', 'size_id')) {
                $table->foreignId('size_id')->nullable()->after('product_id')->constrained('product_sizes')->onDelete('set null');
            }

            if (!Schema::hasColumn('order_items', 'product_name')) {
                $table->string('product_name')->nullable()->after('product_id');
            }

            if (!Schema::hasColumn('order_items', 'size_name')) {
                $table->string('size_name')->nullable()->after('size_id');
            }
        });
    }

    public function down()
    {
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'size_id')) {
                $table->dropForeign(['size_id']);
                $table->dropColumn('size_id');
            }

            if (Schema::hasColumn('order_items', 'product_name')) {
                $table->dropColumn('product_name');
            }

            if (Schema::hasColumn('order_items', 'size_name')) {
                $table->dropColumn('size_name');
            }
        });
    }
};
