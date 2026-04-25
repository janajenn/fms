<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add payment_method column if it doesn't exist
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $table->enum('payment_method', ['cod', 'gcash', 'paymaya', 'bank_transfer'])->default('cod')->after('status');
            }

            // Add payment_status column if it doesn't exist
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'pending_downpayment', 'partial', 'paid', 'failed', 'refunded'])->default('pending')->after('payment_method');
            }

            // Add down_payment_percentage column if it doesn't exist
            if (!Schema::hasColumn('orders', 'down_payment_percentage')) {
                $table->decimal('down_payment_percentage', 5, 2)->default(30)->after('payment_status');
            }

            // Add down_payment_amount column if it doesn't exist
            if (!Schema::hasColumn('orders', 'down_payment_amount')) {
                $table->decimal('down_payment_amount', 10, 2)->default(0)->after('down_payment_percentage');
            }

            // Add remaining_balance column if it doesn't exist
            if (!Schema::hasColumn('orders', 'remaining_balance')) {
                $table->decimal('remaining_balance', 10, 2)->default(0)->after('down_payment_amount');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'down_payment_percentage',
                'down_payment_amount',
                'remaining_balance'
            ]);
        });
    }
};
