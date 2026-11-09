<?php

namespace App\Enums;

enum WasteMovementType: string
{
    case IN = 'IN';
    case OUT = 'OUT';

    public function label(): string
    {
        return match ($this) {
            self::IN => 'Masuk',
            self::OUT => 'Keluar',
        };
    }
}
