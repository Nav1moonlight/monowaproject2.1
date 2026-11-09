<?php

namespace App\Enums;

enum WasteSession: string
{
    case MORNING = 'MORNING';
    case AFTERNOON = 'AFTERNOON';

    public function label(): string
    {
        return match ($this) {
            self::MORNING => 'Sesi Pagi',
            self::AFTERNOON => 'Sesi Sore',
        };
    }
}
