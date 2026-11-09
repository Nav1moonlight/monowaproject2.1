<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'description',
    ];

    /**
     * Scope: Get setting by key
     */
    public function scopeByKey(Builder $query, string $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Static: Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::byKey($key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Static: Set a setting value by key (create or update)
     */
    public static function set(string $key, $value, $description = null)
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'description' => $description]
        );
    }
}
