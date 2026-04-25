<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customization_options', function (Blueprint $table) {
            $table->foreignId('material_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('quantity_used', 10, 2)->default(0); // How much material per unit
        });
    }

    public function down(): void
    {
        Schema::table('customization_options', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropColumn(['material_id', 'quantity_used']);
        });
    }
};
