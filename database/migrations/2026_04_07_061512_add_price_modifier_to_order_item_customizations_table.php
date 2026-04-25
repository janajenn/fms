<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_item_customizations', function (Blueprint $table) {
            if (!Schema::hasColumn('order_item_customizations', 'price_modifier')) {
                $table->decimal('price_modifier', 10, 2)->default(0)->after('value');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_item_customizations', function (Blueprint $table) {
            if (Schema::hasColumn('order_item_customizations', 'price_modifier')) {
                $table->dropColumn('price_modifier');
            }
        });
    }
};
