<?php

namespace App\Services;

use App\Models\B3Transaction;
use App\Models\Notification;
use App\Models\StorageAlert;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class B3TransactionService
{
    /**
     * Create a new B3 transaction
     */
    public function createTransaction(array $data): B3Transaction
    {
        return DB::transaction(function () use ($data) {
            if (isset($data['scale_photo']) && $data['scale_photo'] instanceof UploadedFile) {
                $data['scale_photo_path'] = $data['scale_photo']->store('scale_photos', 'public');
                unset($data['scale_photo']);
            }

            if (auth()->check()) {
                $data['created_by'] = auth()->id() ?? $data['created_by'] ?? null;
            }

            $transaction = B3Transaction::create($data);
            DashboardService::clearCache();

            try {
                $type = ($transaction->transaction_type?->value ?? (string) $transaction->transaction_type) === 'IN' ? 'b3in' : 'b3out';
                $title = ($transaction->transaction_type?->value ?? (string) $transaction->transaction_type) === 'IN' ? 'Transaksi B3 Masuk' : 'Transaksi B3 Keluar';
                $weightFormatted = number_format((float) $transaction->weight_kg, 1, ',', '.');
                $wasteName = $transaction->waste_name ?? 'Limbah B3';

                Notification::create([
                    'type' => $type,
                    'title' => $title,
                    'message' => "Pencatatan {$wasteName} sejumlah {$weightFormatted} kg",
                    'reference_type' => 'B3_TRANSACTION',
                    'reference_id' => $transaction->id,
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // Non-blocking notification creation fallback
            }

            return $transaction;
        });
    }

    /**
     * Update an existing B3 transaction
     */
    public function updateTransaction(B3Transaction $transaction, array $data): B3Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            if (isset($data['scale_photo']) && $data['scale_photo'] instanceof UploadedFile) {
                if ($transaction->scale_photo_path && Storage::disk('public')->exists($transaction->scale_photo_path)) {
                    Storage::disk('public')->delete($transaction->scale_photo_path);
                }
                $data['scale_photo_path'] = $data['scale_photo']->store('scale_photos', 'public');
                unset($data['scale_photo']);
            }

            if (auth()->check()) {
                $data['updated_by'] = auth()->id() ?? $data['updated_by'] ?? null;
            }

            $transaction->update($data);
            DashboardService::clearCache();
            return $transaction;
        });
    }

    /**
     * Delete a B3 transaction
     */
    public function deleteTransaction(B3Transaction $transaction): bool
    {
        return DB::transaction(function () use ($transaction) {
            $deleted = $transaction->delete();
            DashboardService::clearCache();
            return (bool) $deleted;
        });
    }

    /**
     * Get B3 transactions by date range and type
     */
    public function getByDateRange(Carbon $from, Carbon $to, ?string $type = null, int $perPage = 25)
    {
        $query = B3Transaction::byDateRange($from, $to);

        if ($type && in_array($type, ['IN', 'OUT'])) {
            $query->where('transaction_type', $type);
        }

        return $query->with('wasteCategory')
            ->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get transactions near deadline (within X days)
     */
    public function getNearDeadlineTransactions(int $days = 7): array
    {
        return B3Transaction::nearDeadline($days)
            ->with('wasteCategory')
            ->orderBy('storage_deadline_at', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Get expired transactions
     */
    public function getExpiredTransactions(): array
    {
        return B3Transaction::expired()
            ->with('wasteCategory')
            ->orderBy('storage_deadline_at', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Calculate total weight by transaction type
     */
    public function calculateTotalWeightByType(string $type = 'IN', ?array $dateRange = null): float
    {
        $query = B3Transaction::where('transaction_type', $type);

        if ($dateRange && count($dateRange) === 2) {
            $query->byDateRange($dateRange[0], $dateRange[1]);
        }

        return (float) $query->sum('weight_kg');
    }

    /**
     * Get all pending transactions
     */
    public function getPendingTransactions(int $perPage = 25)
    {
        return B3Transaction::byStatus('PENDING')
            ->with('wasteCategory')
            ->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get transaction statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_count' => B3Transaction::count(),
            'in_count' => B3Transaction::in()->count(),
            'out_count' => B3Transaction::out()->count(),
            'pending_count' => B3Transaction::byStatus('PENDING')->count(),
            'total_weight_kg' => (float) B3Transaction::sum('weight_kg'),
            'in_weight_kg' => (float) B3Transaction::in()->sum('weight_kg'),
            'out_weight_kg' => (float) B3Transaction::out()->sum('weight_kg'),
        ];
    }

    /**
     * Get recent transactions
     */
    public function getRecentTransactions(int $limit = 5)
    {
        return B3Transaction::with('wasteCategory')
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Count transactions with specific status
     */
    public function countByStatus(string $status): int
    {
        return B3Transaction::byStatus($status)->count();
    }

    /**
     * Check and create storage alerts for transactions approaching deadline
     */
    public function checkAndCreateStorageAlerts(): int
    {
        $now = Carbon::now();
        $transactions = B3Transaction::query()
            ->where(function ($q) {
                $q->where('transaction_type', 'IN')
                  ->orWhere('transaction_type', \App\Enums\WasteMovementType::IN);
            })
            ->whereNotNull('storage_deadline_at')
            ->where('status', '!=', 'COMPLETED')
            ->get();

        $alertsCreated = 0;

        foreach ($transactions as $tx) {
            $deadline = Carbon::parse($tx->storage_deadline_at);
            $daysLeft = $now->diffInDays($deadline, false);

            $alertType = null;
            $alertTitle = null;
            $alertMsg = null;

            if ($daysLeft < 0) {
                $alertType = 'EXPIRED';
                $alertTitle = 'Batas Simpan B3 Terlewat!';
                $daysOverdue = abs((int) $daysLeft);
                $wasteName = $tx->waste_name ?? 'Limbah B3';
                $alertMsg = "Limbah {$wasteName} telah melebihi batas waktu penyimpanan ({$daysOverdue} hari lalu).";
            } elseif ($daysLeft <= 7) {
                $alertType = 'H-7';
                $alertTitle = 'Peringatan Kritis Masa Simpan B3';
                $wasteName = $tx->waste_name ?? 'Limbah B3';
                $alertMsg = "Limbah {$wasteName} tersisa {$daysLeft} hari sebelum batas maksimal penyimpanan.";
            } elseif ($daysLeft <= 30) {
                $alertType = 'H-30';
                $alertTitle = 'Peringatan Masa Simpan B3';
                $wasteName = $tx->waste_name ?? 'Limbah B3';
                $alertMsg = "Limbah {$wasteName} tersisa {$daysLeft} hari sebelum batas waktu simpan.";
            }

            if ($alertType !== null) {
                $existingAlert = StorageAlert::where('b3_transaction_id', $tx->id)
                    ->where('alert_type', $alertType)
                    ->where('is_active', true)
                    ->first();

                if (!$existingAlert) {
                    DB::transaction(function () use ($tx, $alertType, $deadline, $alertTitle, $alertMsg, &$alertsCreated) {
                        StorageAlert::create([
                            'b3_transaction_id' => $tx->id,
                            'alert_type' => $alertType,
                            'deadline_at' => $deadline,
                            'is_active' => true,
                            'triggered_at' => now(),
                            'notes' => $alertMsg,
                        ]);

                        try {
                            Notification::create([
                                'type' => 'alert',
                                'title' => $alertTitle,
                                'message' => $alertMsg,
                                'reference_type' => 'B3_STORAGE_ALERT',
                                'reference_id' => $tx->id,
                                'is_read' => false,
                            ]);
                        } catch (\Throwable $e) {
                            // Non-blocking notification fallback
                        }

                        $alertsCreated++;
                    });
                }
            }
        }

        return $alertsCreated;
    }

    /**
     * Get single transaction with relations
     */
    public function getTransaction(int $id): ?B3Transaction
    {
        return B3Transaction::with([
            'wasteCategory',
            'storageAlerts',
        ])->find($id);
    }

    /**
     * Search transactions
     */
    public function search(string $query): array
    {
        return B3Transaction::where('waste_code', 'like', "%{$query}%")
            ->orWhere('waste_name', 'like', "%{$query}%")
            ->orWhere('manifest_number', 'like', "%{$query}%")
            ->with('wasteCategory')
            ->limit(20)
            ->get()
            ->toArray();
    }
}
