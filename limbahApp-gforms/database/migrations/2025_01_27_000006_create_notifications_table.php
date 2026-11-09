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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type', 100)->comment('Notification type e.g., B3_RECEIVED, ALERT, etc');
            $table->string('title', 255)->comment('Notification title');
            $table->text('message')->comment('Notification message');
            $table->string('reference_type', 100)->nullable()->comment('Reference type e.g., B3_TRANSACTION');
            $table->unsignedBigInteger('reference_id')->nullable()->comment('Reference ID');
            $table->boolean('is_read')->default(false);
            $table->dateTime('read_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('is_read');
            $table->index(['reference_type', 'reference_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
