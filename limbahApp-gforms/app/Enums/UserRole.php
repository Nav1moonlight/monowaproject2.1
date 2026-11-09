<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN_EHS = 'ADMIN_EHS';
    case OPERATOR_TPS = 'OPERATOR_TPS';
    case AUDITOR = 'AUDITOR';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN_EHS => 'Admin EHS / Manajer Lingkungan',
            self::OPERATOR_TPS => 'Operator TPS / Lapangan',
            self::AUDITOR => 'Auditor / Pengawas (Read-Only)',
        };
    }

    public function canManageUsers(): bool
    {
        return $this === self::ADMIN_EHS;
    }

    public function canDeleteTransactions(): bool
    {
        return $this === self::ADMIN_EHS;
    }

    public function canCreateTransactions(): bool
    {
        return in_array($this, [self::ADMIN_EHS, self::OPERATOR_TPS]);
    }
}
