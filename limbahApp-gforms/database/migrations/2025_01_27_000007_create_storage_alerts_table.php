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
        Schema::create('storage_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('b3_transaction_id')->constrained('b3_transactions')->onDelete('cascade');
            $table->enum('alert_type', ['STORAGE_NEAR_DEADLINE', 'STORAGE_EXPIRED', 'CUSTOM'])->default('STORAGE_NEAR_DEADLINE');
            $table->dateTime('deadline_at')->comment('Alert deadline');
            $table->boolean('is_active')->default(true)->comment('Alert is still active');
            $table->dateTime('triggered_at')->nullable()->comment('When alert was triggered');
            $table->dateTime('acknowledged_at')->nullable()->comment('When alert was acknowledged');
            $table->string('acknowledged_by', 255)->nullable()->comment('Who acknowledged the alert');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('b3_transaction_id');
            $table->index('deadline_at');
            $table->index('is_active');
            $table->index('alert_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_alerts');
    }
};
