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
        Schema::create('waste_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique()->comment('Waste category code e.g., B3001');
            $table->string('name', 255)->comment('Category name');
            $table->text('description')->nullable()->comment('Description');
            $table->enum('waste_type', ['B3', 'DOMESTIC'])->default('B3')->comment('Type of waste');
            $table->timestamps();
            $table->softDeletes();

            $table->index('waste_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_categories');
    }
};
