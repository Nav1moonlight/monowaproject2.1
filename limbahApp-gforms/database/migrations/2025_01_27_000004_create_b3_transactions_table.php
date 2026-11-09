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
        Schema::create('b3_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('transaction_type', ['IN', 'OUT'])->comment('Incoming or Outgoing');
            $table->foreignId('waste_category_id')->constrained('waste_categories')->onDelete('restrict');
            $table->string('waste_code', 50)->comment('Waste code e.g., B3001');
            $table->string('waste_name', 255)->comment('Waste name');
            $table->date('date')->comment('Transaction date');
            $table->string('source', 255)->nullable()->comment('Source location for IN transactions');
            $table->string('destination', 255)->nullable()->comment('Destination for OUT transactions');
            $table->string('transporter', 255)->nullable()->comment('Transporter name');
            $table->string('manifest_number', 100)->nullable()->unique()->comment('Manifest number');
            $table->decimal('weight_kg', 10, 2)->comment('Weight in kilograms');
            $table->enum('status', ['PENDING', 'RECEIVED', 'PROCESSED', 'COMPLETED', 'REJECTED'])->default('PENDING');
            $table->dateTime('storage_deadline_at')->nullable()->comment('Deadline for storage');
            $table->text('notes')->nullable();
            $table->unsignedInteger('created_by')->nullable()->comment('User ID who created');
            $table->unsignedInteger('updated_by')->nullable()->comment('User ID who updated');
            $table->timestamps();
            $table->softDeletes();

            $table->index('waste_category_id');
            $table->index('date');
            $table->index('status');
            $table->index('manifest_number');
            $table->index('storage_deadline_at');
            $table->index('transaction_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('b3_transactions');
    }
};
