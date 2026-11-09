<?php

namespace App\Enums;

enum ProcessingMethod: string
{
    case PROCESSED = 'PROCESSED';
    case LANDFILL = 'LANDFILL';

    public function label(): string
    {
        return match ($this) {
            self::PROCESSED => 'Diolah',
            self::LANDFILL => 'Dibuang ke TPA',
        };
    }
}
