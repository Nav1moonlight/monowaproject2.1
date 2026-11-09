<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DomesticTransaction extends Model
{
    use HasFactory, SoftDeletes;

    public const DETAIL_FIELDS = [
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
    ];

    protected $fillable = [
        'date',
        'movement_type',
        'session',
        'processing_method',

        ...self::DETAIL_FIELDS,

        'organic_weight_kg',
        'inorganic_weight_kg',
        'total_weight_kg',

        'status',
        'pic_name',
        'pic_phone',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',

        'movement_type' => \App\Enums\WasteMovementType::class,
        'session' => \App\Enums\WasteSession::class,
        'processing_method' => \App\Enums\ProcessingMethod::class,
        'status' => \App\Enums\TransactionStatus::class,

        'domestic_residue_kg' => 'decimal:2',
        'leaf_waste_kg' => 'decimal:2',
        'paper_waste_kg' => 'decimal:2',
        'wood_scrap_kg' => 'decimal:2',
        'metal_kg' => 'decimal:2',
        'cardboard_kg' => 'decimal:2',
        'plant_waste_kg' => 'decimal:2',
        'plastic_bottle_kg' => 'decimal:2',
        'plastic_packaging_kg' => 'decimal:2',
        'food_container_kg' => 'decimal:2',
        'wood_cutting_kg' => 'decimal:2',
        'brick_kg' => 'decimal:2',
        'concrete_block_kg' => 'decimal:2',
        'cement_packaging_kg' => 'decimal:2',
        'ceiling_waste_kg' => 'decimal:2',

        'organic_weight_kg' => 'decimal:2',
        'inorganic_weight_kg' => 'decimal:2',
        'total_weight_kg' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::saving(function (DomesticTransaction $transaction): void {
            $organicWeight =
                (float) ($transaction->leaf_waste_kg ?? 0) +
                (float) ($transaction->plant_waste_kg ?? 0);

            $totalWeight = collect(self::DETAIL_FIELDS)
                ->sum(
                    fn (string $field): float =>
                        (float) ($transaction->{$field} ?? 0)
                );

            $transaction->organic_weight_kg = $organicWeight;
            $transaction->inorganic_weight_kg = max(
                0,
                $totalWeight - $organicWeight
            );
            $transaction->total_weight_kg = $totalWeight;
        });
    }

    public function scopeBySession(
        Builder $query,
        string $session
    ): Builder {
        return $query->where('session', $session);
    }

    public function scopeByMovementType(
        Builder $query,
        string $movementType
    ): Builder {
        return $query->where('movement_type', $movementType);
    }

    public function scopeByStatus(
        Builder $query,
        string $status
    ): Builder {
        return $query->where('status', $status);
    }

    public function scopeByDateRange(
        Builder $query,
        Carbon $from,
        Carbon $to
    ): Builder {
        return $query->whereBetween('date', [$from, $to]);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('date', today());
    }
}