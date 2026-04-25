<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('paymongo_payment_id')->nullable()->after('payment_status');
            $table->string('paymongo_checkout_url')->nullable()->after('paymongo_payment_id');
            $table->timestamp('payment_expires_at')->nullable()->after('paymongo_checkout_url');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['paymongo_payment_id', 'paymongo_checkout_url', 'payment_expires_at']);
        });
    }
};
