<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('delivery_zone_locations', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('parent_city');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('place_id')->nullable()->after('longitude');
        });
    }

    public function down()
    {
        Schema::table('delivery_zone_locations', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'place_id']);
        });
    }
};
