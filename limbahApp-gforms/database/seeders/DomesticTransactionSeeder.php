<?php

namespace Database\Seeders;

use App\Models\DomesticTransaction;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DomesticTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = ['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'];
        $picNames = ['Budi Santoso', 'Ahmad Wijaya', 'Siti Nurhaliza', 'Rini Susanti', 'Hendra Kusuma'];
        $sessions = ['MORNING', 'AFTERNOON'];

        // Generate 40 deterministic transactions with guaranteed unique (date, session)
        $count = 0;

        for ($day = 0; $day < 20; $day++) {
            $date = Carbon::now()->subDays($day)->format('Y-m-d');

            foreach ($sessions as $sessionIndex => $session) {
                $organicWeight = 25 + (($day * 7 + $sessionIndex * 13) % 110);
                $inorganicWeight = 35 + (($day * 11 + $sessionIndex * 17) % 140);
                $status = $statuses[($day + $sessionIndex) % count($statuses)];
                $pic = $picNames[($day * 2 + $sessionIndex) % count($picNames)];

                DomesticTransaction::firstOrCreate(
                    [
                        'date' => $date,
                        'session' => $session,
                        'movement_type' => 'IN',
                    ],
                    [
                        'organic_weight_kg' => $organicWeight,
                        'inorganic_weight_kg' => $inorganicWeight,
                        'total_weight_kg' => $organicWeight + $inorganicWeight,
                        'domestic_residue_kg' => round($organicWeight * 0.15, 2),
                        'status' => $status,
                        'pic_name' => $pic,
                        'pic_phone' => '0812' . str_pad((string) (34567890 + $count), 8, '0', STR_PAD_LEFT),
                        'notes' => 'Pencatatan limbah domestik ' . ($session === 'MORNING' ? 'sesi pagi' : 'sesi sore'),
                    ]
                );

                $count++;
            }
        }
    }
}
