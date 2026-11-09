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
        Schema::create('waste_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->unique()->comment('Name of the waste source/location');
            $table->string('code', 50)->nullable()->comment('Location code e.g. WS-UT');
            $table->string('entity', 50)->default('UT')->comment('Entity or unit group: UT, UTPE, OTHER');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->comment('Active status');
            $table->unsignedInteger('created_by')->nullable();
            $table->unsignedInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('entity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_sources');
    }
};
