<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('material_stock_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment', 'order', 'return']);
            $table->decimal('quantity', 10, 2);
            $table->decimal('stock_before', 10, 2);
            $table->decimal('stock_after', 10, 2);
            $table->text('reason')->nullable();
            $table->string('reference')->nullable(); // Order ID, Purchase Order, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_stock_logs');
    }
};
