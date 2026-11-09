<?php

namespace Database\Seeders;

use App\Models\DomesticTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RealDomesticJune2026Seeder extends Seeder
{
    /**
     * Run the database seeds with real Log Book data from United Tractors (June 2026).
     */
    public function run(): void
    {
        $sqlPath = database_path('sql/real_domestic_june_2026.sql');
        if (file_exists($sqlPath)) {
            $sql = file_get_contents($sqlPath);
            DB::unprepared($sql);
            $this->command?->info('Real Domestic Log Book June 2026 data successfully imported!');
        }
    }
}
