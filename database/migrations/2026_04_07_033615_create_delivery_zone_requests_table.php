<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('delivery_zone_requests', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone');
            $table->string('requested_city');
            $table->string('requested_barangay')->nullable();
            $table->text('full_address');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'contacted', 'added_to_zone', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('added_to_zone_id')->nullable()->constrained('delivery_zones');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('delivery_zone_requests');
    }
};
