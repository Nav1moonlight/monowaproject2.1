<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = ['B3_RECEIVED', 'B3_EXPIRED', 'DOMESTIC_SUBMITTED', 'ALERT', 'SYSTEM'];
        $messages = [
            'B3 waste shipment received from Pabrik A',
            'B3 waste storage deadline approaching',
            'Domestic waste submitted for verification',
            'System maintenance scheduled',
            'Alert: Storage capacity at 80%',
            'New B3 transaction created',
            'Domestic waste verified successfully',
        ];

        // Generate 15 sample notifications
        for ($i = 0; $i < 15; $i++) {
            Notification::create([
                'type' => $types[array_rand($types)],
                'title' => 'Notification ' . ($i + 1),
                'message' => $messages[array_rand($messages)],
                'reference_type' => rand(0, 1) ? 'B3_TRANSACTION' : 'DOMESTIC_TRANSACTION',
                'reference_id' => rand(1, 40),
                'is_read' => rand(0, 1) ? false : true,
                'read_at' => rand(0, 1) ? null : now()->subDays(rand(0, 5)),
            ]);
        }
    }
}
