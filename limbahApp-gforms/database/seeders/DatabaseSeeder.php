<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@ehs.com'],
            [
                'name' => 'Admin EHS',
                'password' => bcrypt('password123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'operator@ehs.com'],
            [
                'name' => 'Operator Limbah',
                'password' => bcrypt('password123'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password123'),
            ]
        );

        // Phase 1 Seeders
        $this->call([
            WasteCategorySeeder::class,
            WasteSourceSeeder::class,
            B3TransactionSeeder::class,
            DomesticTransactionSeeder::class,
            NotificationSeeder::class,
            StorageAlertSeeder::class,
        ]);
    }
}
