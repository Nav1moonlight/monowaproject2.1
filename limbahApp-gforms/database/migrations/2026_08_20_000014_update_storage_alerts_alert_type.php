<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('storage_alerts', function (Blueprint $table) {
            $table->string('alert_type', 50)
                ->default('STORAGE_NEAR_DEADLINE')
                ->comment('Alert type: H-30, H-7, EXPIRED, STORAGE_NEAR_DEADLINE, etc.')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storage_alerts', function (Blueprint $table) {
            $table->enum('alert_type', ['STORAGE_NEAR_DEADLINE', 'STORAGE_EXPIRED', 'CUSTOM'])
                ->default('STORAGE_NEAR_DEADLINE')
                ->change();
        });
    }
};
