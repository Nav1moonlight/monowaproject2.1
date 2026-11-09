<?php

namespace Database\Seeders;

use App\Models\WasteCategory;
use Illuminate\Database\Seeder;

class WasteCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // B3 Categories (12 Jenis Limbah B3 Baru)
            ['code' => 'A108d', 'name' => 'Limbah Terkontaminasi B3', 'description' => 'Limbah terkontaminasi B3', 'waste_type' => 'B3'],
            ['code' => 'A331-2', 'name' => 'Sludge dari Oil Treatment atau Fasilitas Penyimpanan', 'description' => 'Sludge dari oil treatment atau fasilitas penyimpanan', 'waste_type' => 'B3'],
            ['code' => 'B353-1', 'name' => 'Toner Bekas', 'description' => 'Toner bekas printer/fotokopi', 'waste_type' => 'B3'],
            ['code' => 'B337-2', 'name' => 'Sludge IPAL', 'description' => 'Sludge dari Instalasi Pengolahan Air Limbah', 'waste_type' => 'B3'],
            ['code' => 'B102d', 'name' => 'Debu dan Fiber Asbes-Asbes Putih', 'description' => 'Debu dan fiber asbes-asbes putih', 'waste_type' => 'B3'],
            ['code' => 'A337-3', 'name' => 'Bahan Kimia Kadaluwarsa', 'description' => 'Bahan kimia kadaluwarsa atau sisa reagen', 'waste_type' => 'B3'],
            ['code' => 'B107d', 'name' => 'Lampu TL, Limbah Elektronik Termasuk Cathode Ray Tube (CRT), PCB, Karet Kawat (Wire Rubber)', 'description' => 'Lampu TL, limbah elektronik CRT, PCB, karet kawat', 'waste_type' => 'B3'],
            ['code' => 'B110d', 'name' => 'Kain Majun Bekas (Used Rags)', 'description' => 'Kain majun bekas pakai terkena pelarut/oli', 'waste_type' => 'B3'],
            ['code' => 'B109d', 'name' => 'Filter Bekas dari Fasilitas Pengendalian Pencemaran Udara', 'description' => 'Filter bekas dari fasilitas pengendali pencemaran udara', 'waste_type' => 'B3'],
            ['code' => 'B105d', 'name' => 'Minyak Pelumas Bekas (Minyak pelumas bekas hidrolik, mesin, gear, dan lainnya)', 'description' => 'Minyak pelumas bekas hidrolik, mesin, gear, dll', 'waste_type' => 'B3'],
            ['code' => 'B104d', 'name' => 'Kemasan Bekas B3', 'description' => 'Wadah atau kemasan bekas bahan B3', 'waste_type' => 'B3'],
            ['code' => 'A102d', 'name' => 'Aki/Baterai Bekas', 'description' => 'Limbah aki dan baterai bekas', 'waste_type' => 'B3'],

            // DOMESTIC Categories
            ['code' => 'DOM001', 'name' => 'Sampah Organik', 'description' => 'Sampah organik dapat terurai', 'waste_type' => 'DOMESTIC'],
            ['code' => 'DOM002', 'name' => 'Sampah Anorganik', 'description' => 'Sampah anorganik sulit terurai', 'waste_type' => 'DOMESTIC'],
            ['code' => 'DOM003', 'name' => 'Kertas & Kardus', 'description' => 'Sampah kertas dan kardus bekas', 'waste_type' => 'DOMESTIC'],
            ['code' => 'DOM004', 'name' => 'Plastik', 'description' => 'Sampah plastik berbagai jenis', 'waste_type' => 'DOMESTIC'],
            ['code' => 'DOM005', 'name' => 'Logam & Kaleng', 'description' => 'Sampah logam dan kaleng bekas', 'waste_type' => 'DOMESTIC'],
            ['code' => 'DOM006', 'name' => 'Kaca & Keramik', 'description' => 'Sampah kaca dan keramik pecah', 'waste_type' => 'DOMESTIC'],
        ];

        foreach ($categories as $category) {
            WasteCategory::updateOrCreate(['code' => $category['code']], $category);
        }

        $newCategories = WasteCategory::where('waste_type', 'B3')
            ->where('code', 'not like', 'B30%')
            ->get();

        if ($newCategories->isNotEmpty()) {
            $oldCategories = WasteCategory::where('waste_type', 'B3')
                ->where('code', 'like', 'B30%')
                ->get();

            foreach ($oldCategories as $idx => $oldCat) {
                $targetCat = $newCategories[$idx % $newCategories->count()];
                \App\Models\B3Transaction::where('waste_category_id', $oldCat->id)
                    ->update([
                        'waste_category_id' => $targetCat->id,
                        'waste_code' => $targetCat->code,
                        'waste_name' => $targetCat->name,
                    ]);
                $oldCat->delete();
            }
        }
    }
}
