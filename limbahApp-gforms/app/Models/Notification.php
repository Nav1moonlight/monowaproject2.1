<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'reference_type',
        'reference_id',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope: Get unread notifications
     */
    public function scopeUnread(Builder $query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeByType(Builder $query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope: Get recent notifications ordered by created_at DESC
     */
    public function scopeRecent(Builder $query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        return $this;
    }
}
