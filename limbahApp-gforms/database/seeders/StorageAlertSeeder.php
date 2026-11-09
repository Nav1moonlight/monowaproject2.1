<?php

namespace Database\Seeders;

use App\Models\B3Transaction;
use App\Models\StorageAlert;
use Illuminate\Database\Seeder;

class StorageAlertSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $b3Transactions = B3Transaction::limit(10)->get();
        $alertTypes = ['STORAGE_NEAR_DEADLINE', 'STORAGE_EXPIRED', 'CUSTOM'];

        foreach ($b3Transactions as $index => $transaction) {
            StorageAlert::create([
                'b3_transaction_id' => $transaction->id,
                'alert_type' => $alertTypes[$index % count($alertTypes)],
                'deadline_at' => $transaction->storage_deadline_at ?? now()->addDays(rand(1, 30)),
                'is_active' => rand(0, 1) ? true : false,
                'triggered_at' => rand(0, 1) ? now()->subDays(rand(0, 5)) : null,
                'acknowledged_at' => null,
                'acknowledged_by' => null,
                'notes' => 'Auto-generated alert for testing',
            ]);
        }
    }
}
