<?php

namespace Database\Seeders;

use App\Models\DomesticTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class LogbookJune2026Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/logbooks/june_2026.json');

        if (!File::exists($jsonPath)) {
            $this->command?->error("File dataset tidak ditemukan: {$jsonPath}");
            return;
        }

        $dataset = json_decode(File::get($jsonPath), true);

        $picName = $dataset['pic_name'] ?? 'KHAIRUL RAFI\'IE';
        $picPhone = $dataset['pic_phone'] ?? '08123456789';
        $notes = $dataset['notes'] ?? 'Diinput otomatis dari foto Log Book Sampah Juni 2026';

        // 1. Process Incoming Waste (Masuk)
        foreach ($dataset['incoming'] ?? [] as $row) {
            DomesticTransaction::updateOrCreate(
                [
                    'date' => $row['date'],
                    'movement_type' => 'IN',
                    'session' => $row['session'],
                ],
                array_merge($row, [
                    'status' => 'VERIFIED',
                    'pic_name' => $picName,
                    'pic_phone' => $picPhone,
                    'notes' => $notes,
                ])
            );
        }

        // 2. Process Outgoing Waste (Keluar)
        foreach ($dataset['outgoing'] ?? [] as $row) {
            DomesticTransaction::updateOrCreate(
                [
                    'date' => $row['date'],
                    'movement_type' => 'OUT',
                    'processing_method' => $row['processing_method'],
                ],
                array_merge($row, [
                    'session' => null,
                    'status' => 'VERIFIED',
                    'pic_name' => $picName,
                    'pic_phone' => $picPhone,
                    'notes' => $notes,
                ])
            );
        }
    }
}
