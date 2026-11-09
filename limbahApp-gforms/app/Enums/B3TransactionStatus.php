<?php

namespace App\Enums;

enum B3TransactionStatus: string
{
    case PENDING = 'PENDING';
    case RECEIVED = 'RECEIVED';
    case PROCESSED = 'PROCESSED';
    case COMPLETED = 'COMPLETED';
    case REJECTED = 'REJECTED';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu',
            self::RECEIVED => 'Diterima',
            self::PROCESSED => 'Diproses',
            self::COMPLETED => 'Selesai',
            self::REJECTED => 'Ditolak',
        };
    }
}
