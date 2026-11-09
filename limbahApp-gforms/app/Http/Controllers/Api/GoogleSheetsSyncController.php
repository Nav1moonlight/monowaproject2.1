<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\B3Transaction;
use App\Models\DomesticTransaction;
use App\Models\WasteCategory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GoogleSheetsSyncController extends Controller
{
    /**
     * Webhook receiver for B3 Waste Form / Sheet submission
     */
    public function syncB3(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            Log::info('Google Sheet B3 Webhook Payload Received', ['data' => $data]);

            $txType = strtoupper(trim($data['movement_type'] ?? $data['jenis_pergerakan'] ?? 'IN'));
            if (!in_array($txType, ['IN', 'OUT'])) {
                $txType = (stripos($txType, 'KELUAR') !== false || stripos($txType, 'OUT') !== false) ? 'OUT' : 'IN';
            }

            $wasteNameInput = trim($data['waste_name'] ?? $data['nama_limbah'] ?? 'Limbah Terkontaminasi B3');
            $category = $this->resolveB3Category($wasteNameInput);

            $dateRaw = $data['date'] ?? $data['tanggal'] ?? now()->toDateString();
            $date = $this->parseFlexibleDate($dateRaw);

            $weightKg = (float) str_replace(',', '.', (string) ($data['weight_kg'] ?? $data['berat_kg'] ?? $data['berat'] ?? 0));
            $source = trim($data['source'] ?? $data['sumber'] ?? 'Area Produksi');
            $transporter = trim($data['transporter'] ?? $data['tujuan'] ?? $data['pihak_ketiga'] ?? '');
            $manifestNumber = trim($data['manifest_number'] ?? $data['nomor_manifest'] ?? '');
            $notes = trim($data['notes'] ?? $data['catatan'] ?? '');
            $photoUrl = trim($data['photo_url'] ?? $data['foto'] ?? '');

            // Storage deadline default: 90 days for B3 Category 1, 180 or 365 for Cat 2
            $deadline = Carbon::parse($date)->addDays(90);

            $tx = B3Transaction::create([
                'transaction_type' => $txType,
                'waste_category_id' => $category ? $category->id : 1,
                'waste_code' => $category ? $category->code : 'A108d',
                'waste_name' => $wasteNameInput,
                'date' => $date,
                'source' => $source,
                'destination' => $transporter ?: ($txType === 'OUT' ? 'Pihak Ketiga Berizin' : null),
                'transporter' => $transporter ?: null,
                'manifest_number' => $manifestNumber ?: null,
                'weight_kg' => $weightKg,
                'remaining_weight_kg' => $txType === 'IN' ? $weightKg : 0,
                'status' => 'PENDING',
                'storage_deadline_at' => $deadline,
                'notes' => $notes . ($photoUrl ? "\nFoto Dokumen: " . $photoUrl : ''),
                'created_by' => 1,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi B3 berhasil disimpan dari Google Form / Sheet',
                'data' => $tx,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('GForm B3 Sync Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses data B3: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Webhook receiver for Domestic Waste Form / Sheet submission
     * Handles single form submission with both Morning (Pagi) and Afternoon (Siang) entries
     */
    public function syncDomestic(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            Log::info('Google Sheet Domestic Webhook Payload Received', ['data' => $data]);

            $dateRaw = $data['date'] ?? $data['tanggal'] ?? now()->toDateString();
            $date = $this->parseFlexibleDate($dateRaw);
            $notes = trim($data['notes'] ?? $data['catatan'] ?? '');

            $createdTransactions = [];

            // Process Morning (Pagi)
            $morningData = $this->extractDomesticDetail($data, 'pagi');
            if ($morningData['total_weight_kg'] > 0 || !empty($data['force_pagi'])) {
                $pagiTx = DomesticTransaction::updateOrCreate(
                    [
                        'date' => $date,
                        'session' => 'MORNING',
                        'movement_type' => 'IN',
                    ],
                    [
                        'processing_method' => null,
                        'pic_name' => 'Operator GForm',
                        'notes' => $notes ?: 'Input via Google Form (Pagi)',
                        'created_by' => 1,
                        ...$morningData,
                    ]
                );
                $createdTransactions[] = $pagiTx;
            }

            // Process Afternoon (Siang)
            $afternoonData = $this->extractDomesticDetail($data, 'siang');
            if ($afternoonData['total_weight_kg'] > 0 || !empty($data['force_siang'])) {
                $siangTx = DomesticTransaction::updateOrCreate(
                    [
                        'date' => $date,
                        'session' => 'AFTERNOON',
                        'movement_type' => 'IN',
                    ],
                    [
                        'processing_method' => null,
                        'pic_name' => 'Operator GForm',
                        'notes' => $notes ?: 'Input via Google Form (Siang)',
                        'created_by' => 1,
                        ...$afternoonData,
                    ]
                );
                $createdTransactions[] = $siangTx;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi Domestik berhasil disimpan dari Google Form / Sheet',
                'records_created' => count($createdTransactions),
                'data' => $createdTransactions,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('GForm Domestic Sync Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses data Domestik: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Pull & Sync all rows from Google Sheets CSV Export URLs
     */
    public function pullFromSheets(): JsonResponse
    {
        $b3SheetUrl = 'https://docs.google.com/spreadsheets/d/1yqvE3ixeipTEKcZgWagbc5ZSYJINUdHrm8UGI3dviMU/export?format=csv';
        $domSheetUrl = 'https://docs.google.com/spreadsheets/d/1d1SylQfhPeRwHxJtq_xfZoAOD5C5Un8nLRTTVG3ihUs/export?format=csv';

        $summary = [
            'b3_synced' => 0,
            'domestic_synced' => 0,
            'errors' => [],
        ];

        // 1. Sync Domestik
        try {
            $domCsv = @file_get_contents($domSheetUrl);
            if ($domCsv) {
                $rows = array_map(fn($line) => str_getcsv($line, ',', '"', '\\'), explode("\n", trim($domCsv)));
                if (count($rows) > 1) {
                    $headers = array_map('trim', $rows[0]);
                    for ($i = 1; $i < count($rows); $i++) {
                        if (empty($rows[$i]) || count($rows[$i]) < 2) continue;
                        $rowAssoc = [];
                        foreach ($headers as $colIdx => $header) {
                            $rowAssoc[$header] = $rows[$i][$colIdx] ?? '';
                        }
                        
                        // Check if already synced using notes containing timestamp or date+session
                        $timestamp = $rowAssoc['Timestamp'] ?? '';
                        $dateRaw = $rowAssoc['Tanggal'] ?? '';
                        $date = $this->parseFlexibleDate($dateRaw ?: $timestamp);

                        // Sync Morning
                        $morningData = $this->extractDomesticDetailFromGSheetRow($rowAssoc, 'Pagi');
                        if ($morningData['total_weight_kg'] > 0) {
                            DomesticTransaction::updateOrCreate(
                                [
                                    'date' => $date,
                                    'session' => 'MORNING',
                                    'movement_type' => 'IN',
                                ],
                                [
                                    'pic_name' => 'GSheet Sync',
                                    'notes' => "Sync GSheet {$timestamp}",
                                    'created_by' => 1,
                                    ...$morningData,
                                ]
                            );
                            $summary['domestic_synced']++;
                        }

                        // Sync Afternoon
                        $afternoonData = $this->extractDomesticDetailFromGSheetRow($rowAssoc, 'Siang');
                        if ($afternoonData['total_weight_kg'] > 0) {
                            DomesticTransaction::updateOrCreate(
                                [
                                    'date' => $date,
                                    'session' => 'AFTERNOON',
                                    'movement_type' => 'IN',
                                ],
                                [
                                    'pic_name' => 'GSheet Sync',
                                    'notes' => "Sync GSheet {$timestamp}",
                                    'created_by' => 1,
                                    ...$afternoonData,
                                ]
                            );
                            $summary['domestic_synced']++;
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            $summary['errors'][] = 'Domestik pull error: ' . $e->getMessage();
        }

        // 2. Sync B3
        try {
            $b3Csv = @file_get_contents($b3SheetUrl);
            if ($b3Csv) {
                $rows = array_map(fn($line) => str_getcsv($line, ',', '"', '\\'), explode("\n", trim($b3Csv)));
                if (count($rows) > 1) {
                    $headers = array_map('trim', $rows[0]);
                    for ($i = 1; $i < count($rows); $i++) {
                        if (empty($rows[$i]) || count($rows[$i]) < 3) continue;
                        $rowAssoc = [];
                        foreach ($headers as $colIdx => $header) {
                            $rowAssoc[$header] = $rows[$i][$colIdx] ?? '';
                        }

                        $timestamp = $rowAssoc['Timestamp'] ?? '';
                        $dateRaw = $rowAssoc['Tanggal Masuk/Keluar'] ?? '';
                        $date = $this->parseFlexibleDate($dateRaw ?: $timestamp);
                        $wasteName = trim($rowAssoc['Nama Limbah B3'] ?? 'Limbah Terkontaminasi B3');
                        $weight = (float) str_replace(',', '.', (string) ($rowAssoc['Berat (kg)'] ?? 0));
                        $txType = strtoupper(trim($rowAssoc['Jenis Pergerakan'] ?? 'IN'));
                        if (stripos($txType, 'KELUAR') !== false || stripos($txType, 'OUT') !== false) {
                            $txType = 'OUT';
                        } else {
                            $txType = 'IN';
                        }

                        if ($weight > 0) {
                            $exists = B3Transaction::where('date', $date)
                                ->where('waste_name', $wasteName)
                                ->where('notes', 'like', "%{$timestamp}%")
                                ->exists();

                            if (!$exists) {
                                $cat = $this->resolveB3Category($wasteName);
                                B3Transaction::create([
                                    'transaction_type' => $txType,
                                    'waste_category_id' => $cat ? $cat->id : 1,
                                    'waste_code' => $cat ? $cat->code : 'A108d',
                                    'waste_name' => $wasteName,
                                    'date' => $date,
                                    'source' => trim($rowAssoc['Sumber / Area Asal Limbah'] ?? 'Area Produksi'),
                                    'destination' => trim($rowAssoc['Tujuan / Pihak Ketiga (jika OUT)'] ?? null),
                                    'manifest_number' => trim($rowAssoc['Nomor Manifest (jika OUT)'] ?? null),
                                    'weight_kg' => $weight,
                                    'remaining_weight_kg' => $txType === 'IN' ? $weight : 0,
                                    'status' => 'PENDING',
                                    'storage_deadline_at' => Carbon::parse($date)->addDays(90),
                                    'notes' => trim($rowAssoc['Catatan Tambahan'] ?? '') . " [Sync GSheet {$timestamp}]",
                                    'created_by' => 1,
                                ]);
                                $summary['b3_synced']++;
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            $summary['errors'][] = 'B3 pull error: ' . $e->getMessage();
        }

        return response()->json([
            'status' => 'success',
            'summary' => $summary,
        ]);
    }

    /**
     * Extract domestic item weights from input keys with suffix (pagi / siang)
     */
    private function extractDomesticDetail(array $data, string $suffix): array
    {
        $fields = [
            'domestic_residue_kg' => ['sampah_residu', 'residu'],
            'leaf_waste_kg' => ['sampah_daun', 'daun'],
            'paper_waste_kg' => ['sampah_kertas', 'kertas'],
            'wood_scrap_kg' => ['pallet_kayu', 'pallet', 'kayu'],
            'metal_kg' => ['besi', 'logam'],
            'cardboard_kg' => ['kardus', 'karton'],
            'plant_waste_kg' => ['sampah_makanan', 'makanan', 'sisa_makanan'],
            'plastic_bottle_kg' => ['botol_plastik', 'botol'],
            'plastic_packaging_kg' => ['kemasan_plastik', 'kresek', 'plastik'],
            'food_container_kg' => ['wadah_makanan', 'styrofoam'],
            'wood_cutting_kg' => ['potongan_kayu'],
            'brick_kg' => ['batu_bata', 'bata'],
            'concrete_block_kg' => ['blok_beton', 'beton'],
            'cement_packaging_kg' => ['kertas_semen', 'semen'],
            'ceiling_waste_kg' => ['plafon', 'gypsum'],
        ];

        $detail = [];
        $totalOrganic = 0.0;
        $totalInorganic = 0.0;

        foreach ($fields as $col => $aliases) {
            $val = 0.0;
            foreach ($aliases as $alias) {
                // Key possibilities: e.g. "sampah_residu_pagi", "residu_pagi", or direct col name "domestic_residue_kg_pagi"
                $candidates = [
                    "{$alias}_{$suffix}",
                    "{$col}_{$suffix}",
                    "{$alias} - {$suffix}",
                    "{$alias}  - {$suffix}",
                ];

                foreach ($candidates as $cand) {
                    if (isset($data[$cand])) {
                        $val = (float) str_replace(',', '.', (string) $data[$cand]);
                        break 2;
                    }
                }
            }

            $detail[$col] = $val;

            // Categorize into organic vs inorganic
            if (in_array($col, ['leaf_waste_kg', 'plant_waste_kg'])) {
                $totalOrganic += $val;
            } else {
                $totalInorganic += $val;
            }
        }

        $detail['organic_weight_kg'] = round($totalOrganic, 2);
        $detail['inorganic_weight_kg'] = round($totalInorganic, 2);
        $detail['total_weight_kg'] = round($totalOrganic + $totalInorganic, 2);

        return $detail;
    }

    /**
     * Map exact Google Sheet column headers to DomesticTransaction columns
     */
    private function extractDomesticDetailFromGSheetRow(array $row, string $sessionWord): array
    {
        $mapping = [
            "Sampah Residu - {$sessionWord}" => 'domestic_residue_kg',
            "Sampah Daun  - {$sessionWord}" => 'leaf_waste_kg',
            "Sampah Daun   - {$sessionWord}" => 'leaf_waste_kg',
            "Sampah Kertas  - {$sessionWord}" => 'paper_waste_kg',
            "Sampah Kertas   - {$sessionWord}" => 'paper_waste_kg',
            "Pallet Kayu  - {$sessionWord}" => 'wood_scrap_kg',
            "Pallet Kayu   - {$sessionWord}" => 'wood_scrap_kg',
            "Besi  - {$sessionWord}" => 'metal_kg',
            "Besi   - {$sessionWord}" => 'metal_kg',
            "Kardus  - {$sessionWord}" => 'cardboard_kg',
            "Kardus   - {$sessionWord}" => 'cardboard_kg',
            "Sampah Makanan  - {$sessionWord}" => 'plant_waste_kg',
            "Sampah Makanan   - {$sessionWord}" => 'plant_waste_kg',
            "Botol Plastik  - {$sessionWord}" => 'plastic_bottle_kg',
            "Botol Plastik   - {$sessionWord}" => 'plastic_bottle_kg',
            "Kemasan Plastik  - {$sessionWord}" => 'plastic_packaging_kg',
            "Kemasan Plastik   - {$sessionWord}" => 'plastic_packaging_kg',
            "Wadah Makanan  - {$sessionWord}" => 'food_container_kg',
            "Wadah Makanan   - {$sessionWord}" => 'food_container_kg',
            "Potongan Kayu  - {$sessionWord}" => 'wood_cutting_kg',
            "Potongan Kayu   - {$sessionWord}" => 'wood_cutting_kg',
            "Batu Bata  - {$sessionWord}" => 'brick_kg',
            "Batu Bata   - {$sessionWord}" => 'brick_kg',
            "Blok Beton  - {$sessionWord}" => 'concrete_block_kg',
            "Blok Beton   - {$sessionWord}" => 'concrete_block_kg',
            "Kertas Semen  - {$sessionWord}" => 'cement_packaging_kg',
            "Kertas Semen   - {$sessionWord}" => 'cement_packaging_kg',
            "Plafon  - {$sessionWord}" => 'ceiling_waste_kg',
            "Plafon   - {$sessionWord}" => 'ceiling_waste_kg',
        ];

        $detail = [];
        $totalOrganic = 0.0;
        $totalInorganic = 0.0;

        foreach (DomesticTransaction::DETAIL_FIELDS as $field) {
            $detail[$field] = 0.0;
        }

        foreach ($row as $header => $value) {
            $trimmedHeader = preg_replace('/\s+/', ' ', trim($header));
            foreach ($mapping as $sheetHeaderPattern => $modelField) {
                $normalizedPattern = preg_replace('/\s+/', ' ', trim($sheetHeaderPattern));
                if (strcasecmp($trimmedHeader, $normalizedPattern) === 0) {
                    $numericVal = (float) str_replace(',', '.', (string) trim($value));
                    $detail[$modelField] = $numericVal;
                    break;
                }
            }
        }

        foreach ($detail as $field => $val) {
            if (in_array($field, ['leaf_waste_kg', 'plant_waste_kg'])) {
                $totalOrganic += $val;
            } else {
                $totalInorganic += $val;
            }
        }

        $detail['organic_weight_kg'] = round($totalOrganic, 2);
        $detail['inorganic_weight_kg'] = round($totalInorganic, 2);
        $detail['total_weight_kg'] = round($totalOrganic + $totalInorganic, 2);

        return $detail;
    }

    /**
     * Resolve waste category from name input
     */
    private function resolveB3Category(string $name): ?WasteCategory
    {
        $nameLower = strtolower($name);

        if (str_contains($nameLower, 'oli') || str_contains($nameLower, 'pelumas')) {
            return WasteCategory::where('code', 'B105d')->first();
        }
        if (str_contains($nameLower, 'majun') || str_contains($nameLower, 'rag')) {
            return WasteCategory::where('code', 'B110d')->first();
        }
        if (str_contains($nameLower, 'kemasan') || str_contains($nameLower, 'drum')) {
            return WasteCategory::where('code', 'B104d')->first();
        }
        if (str_contains($nameLower, 'aki') || str_contains($nameLower, 'baterai') || str_contains($nameLower, 'battery')) {
            return WasteCategory::where('code', 'A102d')->first();
        }
        if (str_contains($nameLower, 'lampu') || str_contains($nameLower, 'elektronik') || str_contains($nameLower, 'tl')) {
            return WasteCategory::where('code', 'B107d')->first();
        }
        if (str_contains($nameLower, 'filter')) {
            return WasteCategory::where('code', 'B109d')->first();
        }
        if (str_contains($nameLower, 'toner')) {
            return WasteCategory::where('code', 'B353-1')->first();
        }
        if (str_contains($nameLower, 'ipal') || str_contains($nameLower, 'sludge')) {
            return WasteCategory::where('code', 'B337-2')->first();
        }
        if (str_contains($nameLower, 'kimia') || str_contains($nameLower, 'chemical')) {
            return WasteCategory::where('code', 'A337-3')->first();
        }

        // Search closest in database
        $found = WasteCategory::where('name', 'like', "%{$name}%")->first();
        return $found ?: WasteCategory::first();
    }

    /**
     * Parse flexible date strings like MM/DD/YYYY, YYYY-MM-DD, or DD/MM/YYYY
     */
    private function parseFlexibleDate(string $raw): string
    {
        $raw = trim($raw);
        if (empty($raw)) {
            return now()->format('Y-m-d 00:00:00');
        }

        try {
            // Format 7/17/2026 or 7/17/2026 14:35:00
            if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})/', $raw, $m)) {
                return Carbon::createFromDate((int) $m[3], (int) $m[1], (int) $m[2])->format('Y-m-d 00:00:00');
            }
            return Carbon::parse($raw)->format('Y-m-d 00:00:00');
        } catch (\Throwable $e) {
            return now()->format('Y-m-d 00:00:00');
        }
    }
}
