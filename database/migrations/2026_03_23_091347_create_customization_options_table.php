<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customization_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('customization_categories')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_modifier', 10, 2)->default(0);
            $table->string('color_code')->nullable();       // for paint/fabric colors
            $table->json('metadata')->nullable();           // extra data like durability, sheen, etc.
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customization_options');
    }
};
