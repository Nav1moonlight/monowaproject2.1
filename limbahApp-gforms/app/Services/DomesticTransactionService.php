<?php

namespace App\Services;

use App\Models\DomesticTransaction;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class DomesticTransactionService
{
    /**
     * Create a new domestic transaction
     */
    public function createTransaction(array $data): DomesticTransaction
    {
        return DB::transaction(function () use ($data) {
            if (auth()->check()) {
                $data['created_by'] = auth()->id() ?? $data['created_by'] ?? null;
            }

            $transaction = DomesticTransaction::create($data);
            DashboardService::clearCache();

            try {
                $totalWeight = (float) ($transaction->total_weight_kg ?? ((float) ($transaction->organic_weight_kg ?? 0) + (float) ($transaction->inorganic_weight_kg ?? 0)));
                $weightFormatted = number_format($totalWeight, 1, ',', '.');
                $sessionName = ($transaction->session?->value ?? (string) $transaction->session) === 'MORNING' ? 'Sesi Pagi' : (($transaction->session?->value ?? (string) $transaction->session) === 'AFTERNOON' ? 'Sesi Sore' : 'Harian');

                Notification::create([
                    'type' => 'domestic',
                    'title' => 'Limbah Domestik (' . $sessionName . ')',
                    'message' => "Pencatatan limbah domestik total {$weightFormatted} kg",
                    'reference_type' => 'DOMESTIC_TRANSACTION',
                    'reference_id' => $transaction->id,
                    'is_read' => false,
                ]);
            } catch (\Throwable $e) {
                // Non-blocking fallback
            }

            return $transaction;
        });
    }

    /**
     * Update an existing domestic transaction
     */
    public function updateTransaction(DomesticTransaction $transaction, array $data): DomesticTransaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            if (auth()->check()) {
                $data['updated_by'] = auth()->id() ?? $data['updated_by'] ?? null;
            }

            $transaction->update($data);
            DashboardService::clearCache();
            return $transaction;
        });
    }

    /**
     * Delete a domestic transaction
     */
    public function deleteTransaction(DomesticTransaction $transaction): bool
    {
        return DB::transaction(function () use ($transaction) {
            $deleted = $transaction->delete();
            DashboardService::clearCache();
            return (bool) $deleted;
        });
    }

    /**
     * Get today's transactions
     */
    public function getTodayTransactions(): array
    {
        return DomesticTransaction::today()
            ->orderBy('session', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Get transactions by date range and optional session
     */
    public function getByDateRange(Carbon $from, Carbon $to, ?string $session = null, int $perPage = 25)
    {
        $query = DomesticTransaction::byDateRange($from, $to);

        if ($session && in_array($session, ['MORNING', 'AFTERNOON'])) {
            $query->bySession($session);
        }

        return $query->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Calculate daily statistics for a specific date
     */
    public function calculateDailyStats(Carbon $date): array
    {
        $query = DomesticTransaction::whereDate('date', $date);

        $organicTotal = (float) $query->clone()->sum('organic_weight_kg');
        $inorganicTotal = (float) $query->clone()->sum('inorganic_weight_kg');
        $count = $query->clone()->count();

        return [
            'date' => $date->format('Y-m-d'),
            'organic_kg' => $organicTotal,
            'inorganic_kg' => $inorganicTotal,
            'total_kg' => (float) ($organicTotal + $inorganicTotal),
            'transaction_count' => $count,
            'morning_count' => $query->clone()->where('session', 'MORNING')->count(),
            'afternoon_count' => $query->clone()->where('session', 'AFTERNOON')->count(),
        ];
    }

    /**
     * Get statistics for date range
     */
    public function getStatsByDateRange(Carbon $from, Carbon $to): array
    {
        $query = DomesticTransaction::byDateRange($from, $to);

        $organicTotal = (float) $query->clone()->sum('organic_weight_kg');
        $inorganicTotal = (float) $query->clone()->sum('inorganic_weight_kg');
        $count = $query->clone()->count();
        $totalWeight = $organicTotal + $inorganicTotal;

        return [
            'date_from' => $from->format('Y-m-d'),
            'date_to' => $to->format('Y-m-d'),
            'organic_kg' => $organicTotal,
            'inorganic_kg' => $inorganicTotal,
            'total_kg' => (float) $totalWeight,
            'transaction_count' => $count,
            'morning_count' => $query->clone()->where('session', 'MORNING')->count(),
            'afternoon_count' => $query->clone()->where('session', 'AFTERNOON')->count(),
            'avg_daily_weight' => $count > 0 ? round($totalWeight / $count, 2) : 0,
        ];
    }

    /**
     * Get overall statistics
     */
    public function getStatistics(): array
    {
        $organicTotal = (float) DomesticTransaction::sum('organic_weight_kg');
        $inorganicTotal = (float) DomesticTransaction::sum('inorganic_weight_kg');

        return [
            'total_count' => DomesticTransaction::count(),
            'morning_count' => DomesticTransaction::where('session', 'MORNING')->count(),
            'afternoon_count' => DomesticTransaction::where('session', 'AFTERNOON')->count(),
            'organic_total_kg' => $organicTotal,
            'inorganic_total_kg' => $inorganicTotal,
            'total_weight_kg' => (float) ($organicTotal + $inorganicTotal),
            'verified_count' => DomesticTransaction::where('status', 'VERIFIED')->count(),
            'draft_count' => DomesticTransaction::where('status', 'DRAFT')->count(),
        ];
    }

    /**
     * Get recent transactions
     */
    public function getRecentTransactions(int $limit = 5)
    {
        return DomesticTransaction::orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get transactions by status
     */
    public function getByStatus(string $status, int $perPage = 25)
    {
        return DomesticTransaction::byStatus($status)
            ->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get transactions by session
     */
    public function getBySession(string $session, int $perPage = 25)
    {
        return DomesticTransaction::bySession($session)
            ->orderBy('date', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get single transaction
     */
    public function getTransaction(int $id): ?DomesticTransaction
    {
        return DomesticTransaction::find($id);
    }

    /**
     * Get today's organic waste total
     */
    public function getTodayOrganicTotal(): float
    {
        return (float) DomesticTransaction::today()->sum('organic_weight_kg');
    }

    /**
     * Get today's inorganic waste total
     */
    public function getTodayInorganicTotal(): float
    {
        return (float) DomesticTransaction::today()->sum('inorganic_weight_kg');
    }

    /**
     * Get today's total waste
     */
    public function getTodayTotalWeight(): float
    {
        return (float) DomesticTransaction::today()->sum('total_weight_kg');
    }
}
