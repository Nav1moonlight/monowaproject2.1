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
        Schema::create('domestic_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date')->comment('Transaction date');
            $table->enum('session', ['MORNING', 'AFTERNOON'])->comment('Morning or Afternoon session');
            $table->decimal('organic_weight_kg', 10, 2)->default(0)->comment('Organic waste weight');
            $table->decimal('inorganic_weight_kg', 10, 2)->default(0)->comment('Inorganic waste weight');
            $table->decimal('total_weight_kg', 10, 2)->default(0)->comment('Total waste weight');
            $table->enum('status', ['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'])->default('DRAFT');
            $table->string('pic_name', 255)->comment('Person in charge name');
            $table->string('pic_phone', 20)->nullable()->comment('Person in charge phone');
            $table->text('notes')->nullable();
            $table->unsignedInteger('created_by')->nullable();
            $table->unsignedInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['date', 'session'], 'unique_date_session');
            $table->index('date');
            $table->index('status');
            $table->index('session');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domestic_transactions');
    }
};
