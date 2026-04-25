<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('delivery_zone_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_zone_id')->constrained()->onDelete('cascade');
            $table->string('location_type'); // city, municipality, barangay
            $table->string('location_name');
            $table->string('parent_city')->nullable(); // For barangays, which city they belong to
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Fix: Use shorter custom name for unique constraint
            $table->unique(['delivery_zone_id', 'location_type', 'location_name'], 'dz_locations_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('delivery_zone_locations');
    }
};
