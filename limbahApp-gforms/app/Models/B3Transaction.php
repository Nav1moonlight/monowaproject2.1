<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class B3Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_type',
        'waste_category_id',
        'waste_code',
        'waste_name',
        'date',
        'source',
        'destination',
        'transporter',
        'manifest_number',
        'weight_kg',
        'remaining_weight_kg',
        'status',
        'storage_deadline_at',
        'scale_photo_path',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date' => 'date',
        'storage_deadline_at' => 'datetime',
        'weight_kg' => 'decimal:2',
        'remaining_weight_kg' => 'decimal:2',
        'transaction_type' => \App\Enums\WasteMovementType::class,
        'status' => \App\Enums\B3TransactionStatus::class,
    ];

    /**
     * Get the waste category for this transaction
     */
    public function wasteCategory()
    {
        return $this->belongsTo(WasteCategory::class);
    }

    /**
     * Get the user who created this transaction
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this transaction
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all storage alerts for this transaction
     */
    public function storageAlerts()
    {
        return $this->hasMany(StorageAlert::class);
    }

    /**
     * Scope: Filter incoming transactions
     */
    public function scopeIn(Builder $query)
    {
        return $query->where('transaction_type', 'IN');
    }

    /**
     * Scope: Filter outgoing transactions
     */
    public function scopeOut(Builder $query)
    {
        return $query->where('transaction_type', 'OUT');
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus(Builder $query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by date range
     */
    public function scopeByDateRange(Builder $query, Carbon $from, Carbon $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }

    /**
     * Scope: Get transactions near deadline (within specified days)
     */
    public function scopeNearDeadline(Builder $query, int $days = 7)
    {
        $from = now();
        $to = now()->addDays($days);
        return $query->whereBetween('storage_deadline_at', [$from, $to]);
    }

    /**
     * Scope: Get expired transactions
     */
    public function scopeExpired(Builder $query)
    {
        return $query->where('storage_deadline_at', '<', now());
    }

    /**
     * Check if transaction is near deadline
     */
    public function getIsNearDeadlineAttribute(): bool
    {
        if (!$this->storage_deadline_at) {
            return false;
        }
        return $this->storage_deadline_at->isBetween(now(), now()->addDays(7));
    }

    /**
     * Check if transaction is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        if (!$this->storage_deadline_at) {
            return false;
        }
        return $this->storage_deadline_at->isPast();
    }
}
