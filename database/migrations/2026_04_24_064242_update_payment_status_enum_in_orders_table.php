<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Modify the payment_status column to include new values
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'pending_payment', 'pending_downpayment', 'partial', 'paid', 'failed', 'refunded', 'expired') DEFAULT 'pending'");
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'");
        });
    }
};
