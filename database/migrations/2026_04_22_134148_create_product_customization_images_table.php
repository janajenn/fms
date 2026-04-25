<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('product_customization_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('customization_option_id')->constrained()->onDelete('cascade');
            $table->string('image_path')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'customization_option_id'], 'prod_customization_unique');
        });
    }

    public function down()
    {
        Schema::dropIfExists('product_customization_images');
    }
};
