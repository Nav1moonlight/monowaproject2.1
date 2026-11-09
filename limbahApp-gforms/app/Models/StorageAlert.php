<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'b3_transaction_id',
        'alert_type',
        'deadline_at',
        'is_active',
        'triggered_at',
        'acknowledged_at',
        'acknowledged_by',
        'notes',
    ];

    protected $casts = [
        'deadline_at' => 'datetime',
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'is_active' => 'boolean',
        'alert_type' => 'string',
    ];

    /**
     * Get the B3 transaction for this alert
     */
    public function b3Transaction()
    {
        return $this->belongsTo(B3Transaction::class);
    }

    /**
     * Scope: Get active alerts
     */
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get pending (not triggered) alerts
     */
    public function scopePending(Builder $query)
    {
        return $query->where('triggered_at', null);
    }

    /**
     * Scope: Get triggered alerts
     */
    public function scopeTriggered(Builder $query)
    {
        return $query->whereNotNull('triggered_at');
    }

    /**
     * Acknowledge the alert
     */
    public function acknowledge(string $acknowledgedBy)
    {
        $this->update([
            'acknowledged_at' => now(),
            'acknowledged_by' => $acknowledgedBy,
            'is_active' => false,
        ]);
        return $this;
    }

    /**
     * Trigger the alert
     */
    public function trigger()
    {
        $this->update(['triggered_at' => now()]);
        return $this;
    }
}
