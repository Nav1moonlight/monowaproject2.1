<?php

namespace Database\Seeders;

use App\Models\WasteSource;
use Illuminate\Database\Seeder;

class WasteSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'Workshop UT',
                'code' => 'WS-UT',
                'entity' => 'UT',
                'description' => 'Area Workshop United Tractors',
                'is_active' => true,
            ],
            [
                'name' => 'Workshop UTPE',
                'code' => 'WS-UTPE',
                'entity' => 'UTPE',
                'description' => 'Area Workshop UTPE',
                'is_active' => true,
            ],
            [
                'name' => 'Warehouse UT',
                'code' => 'WH-UT',
                'entity' => 'UT',
                'description' => 'Area Warehouse / Gudang United Tractors',
                'is_active' => true,
            ],
            [
                'name' => 'Warehouse UTPE',
                'code' => 'WH-UTPE',
                'entity' => 'UTPE',
                'description' => 'Area Warehouse / Gudang UTPE',
                'is_active' => true,
            ],
            [
                'name' => 'Office UT',
                'code' => 'OFF-UT',
                'entity' => 'UT',
                'description' => 'Area Perkantoran United Tractors',
                'is_active' => true,
            ],
            [
                'name' => 'Office UTPE',
                'code' => 'OFF-UTPE',
                'entity' => 'UTPE',
                'description' => 'Area Perkantoran UTPE',
                'is_active' => true,
            ],
        ];

        foreach ($sources as $source) {
            WasteSource::updateOrCreate(
                ['name' => $source['name']],
                $source
            );
        }
    }
}
