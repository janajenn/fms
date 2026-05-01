<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('receiver_latitude', 10, 8)->nullable()->after('shipping_address');
            $table->decimal('receiver_longitude', 11, 8)->nullable()->after('receiver_latitude');
            $table->string('receiver_city')->nullable()->after('receiver_longitude');
            $table->string('receiver_barangay')->nullable()->after('receiver_city');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['receiver_latitude', 'receiver_longitude', 'receiver_city', 'receiver_barangay']);
        });
    }
};
