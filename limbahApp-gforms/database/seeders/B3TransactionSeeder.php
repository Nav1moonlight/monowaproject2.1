<?php

namespace Database\Seeders;

use App\Models\B3Transaction;
use App\Models\WasteCategory;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class B3TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $b3Categories = WasteCategory::where('waste_type', 'B3')->get();
        $statuses = ['PENDING', 'RECEIVED', 'PROCESSED', 'COMPLETED', 'REJECTED'];
        $sources = ['Pabrik A', 'Pabrik B', 'Supplier X', 'Industri Kimia', 'Laboratorium'];
        $destinations = ['Incinerator', 'TPA B3', 'Pengolahan Limbah', 'Recycling Center'];
        $transporters = ['PT. Jaya Transport', 'CV. Bina Jaya', 'PT. Maju Sejahtera'];

        // Generate 40 sample transactions
        for ($i = 0; $i < 40; $i++) {
            $category = $b3Categories->random();
            $transactionType = rand(0, 1) ? 'IN' : 'OUT';
            $date = Carbon::now()->subDays(rand(0, 30));
            $weight = rand(100, 5000);

            // 2 transactions with expired deadlines for alert testing
            if ($i < 2) {
                $storageDeadline = Carbon::now()->subDays(rand(1, 10));
            } else {
                $storageDeadline = rand(0, 1) ? Carbon::now()->addDays(rand(1, 30)) : null;
            }

            B3Transaction::create([
                'transaction_type' => $transactionType,
                'waste_category_id' => $category->id,
                'waste_code' => $category->code,
                'waste_name' => $category->name,
                'date' => $date,
                'source' => $transactionType === 'IN' ? $sources[array_rand($sources)] : null,
                'destination' => $transactionType === 'OUT' ? $destinations[array_rand($destinations)] : null,
                'transporter' => $transporters[array_rand($transporters)],
                'manifest_number' => 'MF-' . strtoupper(uniqid()),
                'weight_kg' => $weight,
                'status' => $statuses[array_rand($statuses)],
                'storage_deadline_at' => $storageDeadline,
                'notes' => 'Sample transaction ' . ($i + 1),
            ]);
        }
    }
}
