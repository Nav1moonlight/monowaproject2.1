<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('b3_transactions', function (Blueprint $table) {
            $table->decimal('remaining_weight_kg', 10, 2)->nullable()->after('weight_kg');
            $table->string('scale_photo_path')->nullable()->after('storage_deadline_at');
        });

        Schema::table('domestic_transactions', function (Blueprint $table) {
            $table->dropUnique('unique_date_session');

            $table->enum('movement_type', ['IN', 'OUT'])
                ->default('IN')
                ->after('date')
                ->comment('Sampah masuk atau keluar');

            $table->enum('session', ['MORNING', 'AFTERNOON'])
                ->nullable()
                ->change();

            $table->string('processing_method', 50)->nullable()->after('session');

            $table->decimal('domestic_residue_kg', 10, 2)->default(0);
            $table->decimal('leaf_waste_kg', 10, 2)->default(0);
            $table->decimal('paper_waste_kg', 10, 2)->default(0);
            $table->decimal('wood_scrap_kg', 10, 2)->default(0);
            $table->decimal('metal_kg', 10, 2)->default(0);
            $table->decimal('cardboard_kg', 10, 2)->default(0);
            $table->decimal('plant_waste_kg', 10, 2)->default(0);
            $table->decimal('plastic_bottle_kg', 10, 2)->default(0);
            $table->decimal('plastic_packaging_kg', 10, 2)->default(0);
            $table->decimal('food_container_kg', 10, 2)->default(0);
            $table->decimal('wood_cutting_kg', 10, 2)->default(0);
            $table->decimal('brick_kg', 10, 2)->default(0);
            $table->decimal('concrete_block_kg', 10, 2)->default(0);
            $table->decimal('cement_packaging_kg', 10, 2)->default(0);
            $table->decimal('ceiling_waste_kg', 10, 2)->default(0);

            $table->unique(['date', 'session', 'movement_type'], 'unique_date_session_movement');
            $table->index('movement_type');
        });
    }

    public function down(): void
    {
        Schema::table('domestic_transactions', function (Blueprint $table) {
            $table->dropUnique('unique_date_session_movement');
            $table->dropIndex(['movement_type']);

            $table->dropColumn([
                'movement_type',
                'processing_method',
                'domestic_residue_kg',
                'leaf_waste_kg',
                'paper_waste_kg',
                'wood_scrap_kg',
                'metal_kg',
                'cardboard_kg',
                'plant_waste_kg',
                'plastic_bottle_kg',
                'plastic_packaging_kg',
                'food_container_kg',
                'wood_cutting_kg',
                'brick_kg',
                'concrete_block_kg',
                'cement_packaging_kg',
                'ceiling_waste_kg',
            ]);

            $table->enum('session', ['MORNING', 'AFTERNOON'])
                ->nullable(false)
                ->change();

            $table->unique(['date', 'session'], 'unique_date_session');
        });

        Schema::table('b3_transactions', function (Blueprint $table) {
            $table->dropColumn(['remaining_weight_kg', 'scale_photo_path']);
        });
    }
};
