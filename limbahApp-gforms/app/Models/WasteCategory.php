<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WasteCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['code', 'name', 'description', 'waste_type'];

    protected $casts = [
        'waste_type' => 'string',
    ];

    /**
     * Get all B3 transactions for this category
     */
    public function b3Transactions()
    {
        return $this->hasMany(B3Transaction::class);
    }

    /**
     * Scope: Filter B3 waste categories
     */
    public function scopeB3(Builder $query)
    {
        return $query->where('waste_type', 'B3');
    }

    /**
     * Scope: Filter domestic waste categories
     */
    public function scopeDomestic(Builder $query)
    {
        return $query->where('waste_type', 'DOMESTIC');
    }
}
