<?php

namespace App\Enums;

enum StorageAlertType: string
{
    case H_30 = 'H-30';
    case H_7 = 'H-7';
    case EXPIRED = 'EXPIRED';
    case STORAGE_NEAR_DEADLINE = 'STORAGE_NEAR_DEADLINE';
    case STORAGE_EXPIRED = 'STORAGE_EXPIRED';
    case CUSTOM = 'CUSTOM';

    public function label(): string
    {
        return match ($this) {
            self::H_30 => 'Peringatan H-30 Masa Simpan',
            self::H_7 => 'Peringatan Kritis H-7 Masa Simpan',
            self::EXPIRED => 'Masa Simpan Terlewat (Expired)',
            self::STORAGE_NEAR_DEADLINE => 'Mendekati Batas Masa Simpan',
            self::STORAGE_EXPIRED => 'Batas Masa Simpan Kedaluwarsa',
            self::CUSTOM => 'Peringatan Khusus',
        };
    }
}
