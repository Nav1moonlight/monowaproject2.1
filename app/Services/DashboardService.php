<?php

namespace App\Services;

use App\Models\B3Transaction;
use App\Models\DomesticTransaction;
use App\Models\Notification;
use App\Models\StorageAlert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    protected B3TransactionService $b3Service;
    protected DomesticTransactionService $domesticService;

    /**
     * Constructor
     */
    public function __construct(
        B3TransactionService $b3Service,
        DomesticTransactionService $domesticService
    ) {
        $this->b3Service = $b3Service;
        $this->domesticService = $domesticService;
    }

    /**
     * Get comprehensive dashboard summary with all KPIs (Cached KPIs for 5 mins)
     */
    public function getSummary(): array
    {
        $kpis = Cache::remember('dashboard_kpi_summary', 300, function () {
            $b3Stats = $this->b3Service->getStatistics();
            $domesticTodayStats = $this->domesticService->calculateDailyStats(today());

            return [
                // B3 Statistics
                'b3_total_weight_kg' => $b3Stats['total_weight_kg'],
                'b3_count_in' => $b3Stats['in_count'],
                'b3_count_out' => $b3Stats['out_count'],
                'b3_in_weight_kg' => $b3Stats['in_weight_kg'],
                'b3_out_weight_kg' => $b3Stats['out_weight_kg'],
                'b3_pending_count' => $b3Stats['pending_count'],

                // Domestic Statistics (Today)
                'domestic_today_organic_kg' => $domesticTodayStats['organic_kg'],
                'domestic_today_inorganic_kg' => $domesticTodayStats['inorganic_kg'],
                'domestic_today_total_kg' => $domesticTodayStats['total_kg'],

                // Alert Statistics
                'storage_alerts_active' => StorageAlert::active()->count(),
                'storage_alerts_expired' => StorageAlert::active()
                    ->where('deadline_at', '<', now())
                    ->count(),

                // Notification Statistics
                'notifications_unread' => Notification::unread()->count(),
            ];
        });

        return array_merge($kpis, [
            // Recent Data (fresh Eloquent models for Resource collections)
            'recent_b3_transactions' => $this->b3Service->getRecentTransactions(5),
            'recent_domestic_transactions' => $this->domesticService->getRecentTransactions(5),
            'recent_alerts' => $this->getRecentAlerts(5),
        ]);
    }

    /**
     * Get all active and pending alerts
     */
    public function getAlerts(): array
    {
        $alerts = StorageAlert::active()
            ->with('b3Transaction.wasteCategory')
            ->orderBy('deadline_at', 'asc')
            ->get();

        return $alerts->map(function ($alert) {
            $tx = data_get($alert, 'b3Transaction') ?? data_get($alert, 'b3_transaction');
            $deadline = data_get($alert, 'deadline_at');
            $deadlineCarbon = $deadline ? (is_string($deadline) ? Carbon::parse($deadline) : $deadline) : null;
            $triggered = data_get($alert, 'triggered_at');

            return [
                'id' => data_get($alert, 'id'),
                'alert_type' => data_get($alert, 'alert_type'),
                'is_active' => (bool) (data_get($alert, 'is_active') ?? true),
                'deadline_at' => $deadlineCarbon?->toIso8601String(),
                'is_expired' => $deadlineCarbon?->isPast() ?? false,
                'days_until_deadline' => $deadlineCarbon ? $deadlineCarbon->diffInDays(now(), false) : 0,
                'is_triggered' => $triggered !== null,
                'triggered_at' => $triggered ? (is_string($triggered) ? Carbon::parse($triggered)->toIso8601String() : $triggered->toIso8601String()) : null,
                'b3_transaction' => $tx ? [
                    'id' => data_get($tx, 'id'),
                    'waste_code' => data_get($tx, 'waste_code'),
                    'waste_name' => data_get($tx, 'waste_name'),
                    'transaction_type' => data_get($tx, 'transaction_type'),
                    'weight_kg' => data_get($tx, 'weight_kg'),
                    'status' => data_get($tx, 'status'),
                ] : null,
            ];
        })->toArray();
    }

    /**
     * Get recent alerts
     */
    public function getRecentAlerts(int $limit = 5)
    {
        return StorageAlert::with('b3Transaction.wasteCategory')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get dashboard with date range filters
     */
    public function getSummaryByDateRange(Carbon $from, Carbon $to): array
    {
        $b3StatsRange = [
            'in_weight_kg' => $this->b3Service->calculateTotalWeightByType('IN', [$from, $to]),
            'out_weight_kg' => $this->b3Service->calculateTotalWeightByType('OUT', [$from, $to]),
            'total_transactions' => B3Transaction::byDateRange($from, $to)->count(),
        ];

        $domesticStatsRange = $this->domesticService->getStatsByDateRange($from, $to);

        return [
            'period' => [
                'from' => $from->format('Y-m-d'),
                'to' => $to->format('Y-m-d'),
            ],
            'b3' => $b3StatsRange,
            'domestic' => $domesticStatsRange,
            'alerts_count' => StorageAlert::whereHas('b3Transaction', function ($query) use ($from, $to) {
                $query->byDateRange($from, $to);
            })->count(),
        ];
    }

    /**
     * Get near-deadline alerts for warnings
     */
    public function getNearDeadlineWarnings(int $days = 7): array
    {
        $transactions = $this->b3Service->getNearDeadlineTransactions($days);

        return array_map(function ($transaction) {
            $daysRemaining = Carbon::parse($transaction['storage_deadline_at'])->diffInDays(now(), false);
            return [
                'id' => $transaction['id'],
                'waste_name' => $transaction['waste_name'],
                'storage_deadline_at' => $transaction['storage_deadline_at'],
                'days_remaining' => $daysRemaining,
                'priority' => $daysRemaining <= 2 ? 'HIGH' : ($daysRemaining <= 5 ? 'MEDIUM' : 'LOW'),
            ];
        }, $transactions);
    }

    /**
     * Get expired alerts for critical warnings
     */
    public function getExpiredWarnings(): array
    {
        $transactions = $this->b3Service->getExpiredTransactions();

        return array_map(function ($transaction) {
            $daysExpired = abs(Carbon::parse($transaction['storage_deadline_at'])->diffInDays(now(), false));
            return [
                'id' => $transaction['id'],
                'waste_name' => $transaction['waste_name'],
                'storage_deadline_at' => $transaction['storage_deadline_at'],
                'days_expired' => $daysExpired,
                'priority' => 'CRITICAL',
            ];
        }, $transactions);
    }

    /**
     * Get monthly trends (Cached for 10 mins)
     */
    public function getMonthlyTrends(int $months = 12, ?int $year = null): array
    {
        $cacheKey = 'dashboard_trends_' . ($year ?? 'all') . '_' . $months;

        return Cache::remember($cacheKey, 600, function () use ($months, $year) {
            $startDate = $year ? Carbon::create($year, 1, 1)->startOfDay() : now()->subMonths($months - 1)->startOfMonth()->startOfDay();
            $endDate = $year ? Carbon::create($year, 12, 31)->endOfDay() : now()->endOfMonth()->endOfDay();

            $isSqlite = DB::connection()->getDriverName() === 'sqlite';
            $dateGroupExpr = $isSqlite ? "strftime('%Y-%m', date)" : "DATE_FORMAT(date, '%Y-%m')";

            // Query B3 transactions grouped by YYYY-MM
            $b3Stats = B3Transaction::selectRaw("
                    {$dateGroupExpr} as ym,
                    SUM(CASE WHEN transaction_type = 'IN' THEN weight_kg ELSE 0 END) as in_weight,
                    SUM(CASE WHEN transaction_type = 'OUT' THEN weight_kg ELSE 0 END) as out_weight
                ")
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('ym')
                ->get()
                ->keyBy('ym');

            // Query Domestic transactions grouped by YYYY-MM
            $domStats = DomesticTransaction::selectRaw("
                    {$dateGroupExpr} as ym,
                    SUM(organic_weight_kg) as organic_weight,
                    SUM(inorganic_weight_kg) as inorganic_weight,
                    SUM(total_weight_kg) as total_weight
                ")
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('ym')
                ->get()
                ->keyBy('ym');

            $trends = [];
            $totalSteps = $year ? 12 : $months;

            for ($i = 0; $i < $totalSteps; $i++) {
                $date = $year 
                    ? Carbon::create($year, $i + 1, 1)
                    : now()->subMonths($months - 1 - $i);

                $ym = $date->format('Y-m');
                $b3Row = $b3Stats->get($ym);
                $domRow = $domStats->get($ym);

                $b3InWeight = (float) ($b3Row?->in_weight ?? 0);
                $b3OutWeight = (float) ($b3Row?->out_weight ?? 0);

                $domOrganicWeight = (float) ($domRow?->organic_weight ?? 0);
                $domInorganicWeight = (float) ($domRow?->inorganic_weight ?? 0);
                $domTotalWeight = (float) ($domRow?->total_weight ?? 0);

                $trends[] = [
                    'month' => $ym,
                    'month_name' => $year ? $date->format('M') : $date->format('M Y'),
                    'b3_in_weight_kg' => $b3InWeight,
                    'b3_out_weight_kg' => $b3OutWeight,
                    'b3_weight_kg' => $b3InWeight + $b3OutWeight,
                    'domestic_organic_kg' => $domOrganicWeight,
                    'domestic_inorganic_kg' => $domInorganicWeight,
                    'domestic_weight_kg' => $domTotalWeight > 0 ? $domTotalWeight : ($domOrganicWeight + $domInorganicWeight),
                ];
            }

            return $trends;
        });
    }

    /**
     * Get category breakdown (Cached for 10 mins)
     */
    public function getCategoryBreakdown(): array
    {
        return Cache::remember('dashboard_category_breakdown', 600, function () {
            return B3Transaction::join('waste_categories', 'b3_transactions.waste_category_id', '=', 'waste_categories.id')
                ->selectRaw('
                    waste_categories.id as category_id,
                    waste_categories.name as category_name,
                    waste_categories.code as category_code,
                    COUNT(*) as transaction_count,
                    COALESCE(SUM(b3_transactions.weight_kg), 0) as total_weight_kg,
                    COALESCE(SUM(CASE WHEN b3_transactions.transaction_type = "IN" THEN b3_transactions.weight_kg ELSE 0 END), 0) as in_weight_kg,
                    COALESCE(SUM(CASE WHEN b3_transactions.transaction_type = "OUT" THEN b3_transactions.weight_kg ELSE 0 END), 0) as out_weight_kg,
                    SUM(CASE WHEN b3_transactions.transaction_type = "IN" THEN 1 ELSE 0 END) as in_count,
                    SUM(CASE WHEN b3_transactions.transaction_type = "OUT" THEN 1 ELSE 0 END) as out_count
                ')
                ->groupBy('waste_categories.id', 'waste_categories.name', 'waste_categories.code')
                ->get()
                ->map(function ($row) {
                    return [
                        'category_id' => (int) $row->category_id,
                        'category_name' => $row->category_name,
                        'category_code' => $row->category_code,
                        'transaction_count' => (int) $row->transaction_count,
                        'total_weight_kg' => (float) $row->total_weight_kg,
                        'in_weight_kg' => (float) $row->in_weight_kg,
                        'out_weight_kg' => (float) $row->out_weight_kg,
                        'in_count' => (int) $row->in_count,
                        'out_count' => (int) $row->out_count,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get yearly trends for B3 & Domestic waste (Cached for 10 mins)
     */
    public function getYearlyTrends(int $years = 5): array
    {
        $cacheKey = 'dashboard_trends_yearly_' . $years;

        return Cache::remember($cacheKey, 600, function () use ($years) {
            $currentYear = (int) date('Y');
            $startYear = $currentYear - ($years - 1);
            $startDate = Carbon::create($startYear, 1, 1)->startOfDay();
            $endDate = Carbon::create($currentYear, 12, 31)->endOfDay();

            $isSqlite = DB::connection()->getDriverName() === 'sqlite';
            $dateGroupExpr = $isSqlite ? "strftime('%Y', date)" : "DATE_FORMAT(date, '%Y')";

            // Query B3 transactions grouped by year
            $b3Stats = B3Transaction::selectRaw("
                    {$dateGroupExpr} as yr,
                    SUM(CASE WHEN transaction_type = 'IN' THEN weight_kg ELSE 0 END) as in_weight,
                    SUM(CASE WHEN transaction_type = 'OUT' THEN weight_kg ELSE 0 END) as out_weight
                ")
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('yr')
                ->get()
                ->keyBy('yr');

            // Query Domestic transactions grouped by year
            $domStats = DomesticTransaction::selectRaw("
                    {$dateGroupExpr} as yr,
                    SUM(organic_weight_kg) as organic_weight,
                    SUM(inorganic_weight_kg) as inorganic_weight,
                    SUM(total_weight_kg) as total_weight,
                    SUM(CASE WHEN session = 'MORNING' THEN total_weight_kg ELSE 0 END) as morning_weight,
                    SUM(CASE WHEN session = 'AFTERNOON' THEN total_weight_kg ELSE 0 END) as afternoon_weight
                ")
                ->whereBetween('date', [$startDate, $endDate])
                ->groupBy('yr')
                ->get()
                ->keyBy('yr');

            $trends = [];
            for ($y = $startYear; $y <= $currentYear; $y++) {
                $yrStr = (string) $y;
                $b3Row = $b3Stats->get($yrStr);
                $domRow = $domStats->get($yrStr);

                $b3InWeight = (float) ($b3Row?->in_weight ?? 0);
                $b3OutWeight = (float) ($b3Row?->out_weight ?? 0);
                $domOrganic = (float) ($domRow?->organic_weight ?? 0);
                $domInorganic = (float) ($domRow?->inorganic_weight ?? 0);
                $domMorning = (float) ($domRow?->morning_weight ?? 0);
                $domAfternoon = (float) ($domRow?->afternoon_weight ?? 0);
                $domTotal = (float) ($domRow?->total_weight ?? 0);

                $trends[] = [
                    'name' => $yrStr,
                    'year' => $yrStr,
                    'b3in' => $b3InWeight,
                    'b3out' => $b3OutWeight,
                    'b3_in_weight_kg' => $b3InWeight,
                    'b3_out_weight_kg' => $b3OutWeight,
                    'b3_weight_kg' => $b3InWeight + $b3OutWeight,
                    'morning' => $domMorning > 0 ? $domMorning : round($domTotal / 2, 2),
                    'afternoon' => $domAfternoon > 0 ? $domAfternoon : round($domTotal / 2, 2),
                    'organic' => $domOrganic,
                    'inorganic' => $domInorganic,
                    'domestic_organic_kg' => $domOrganic,
                    'domestic_inorganic_kg' => $domInorganic,
                    'domestic_weight_kg' => $domTotal > 0 ? $domTotal : ($domOrganic + $domInorganic),
                ];
            }

            return $trends;
        });
    }

    /**
     * Clear all cached dashboard KPIs, trends, and category aggregations.
     */
    public static function clearCache(): void
    {
        Cache::forget('dashboard_summary');
        Cache::forget('dashboard_kpi_summary');
        Cache::forget('dashboard_category_breakdown');

        $currentYear = (int) date('Y');
        for ($y = $currentYear - 3; $y <= $currentYear + 2; $y++) {
            Cache::forget("dashboard_trends_{$y}_12");
            Cache::forget("dashboard_trends_{$y}_6");
        }
        Cache::forget('dashboard_trends_all_12');
        Cache::forget('dashboard_trends_all_6');
        Cache::forget('dashboard_trends_yearly_5');
        Cache::forget('dashboard_trends_yearly_10');
    }

    /**
     * Get health check status
     */
    public function getHealthStatus(): array
    {
        $expiredCount = StorageAlert::active()
            ->where('deadline_at', '<', now())
            ->count();

        $nearDeadlineCount = $this->b3Service->getNearDeadlineTransactions(7);

        $status = 'HEALTHY';
        if ($expiredCount > 0) {
            $status = 'CRITICAL';
        } elseif (count($nearDeadlineCount) > 5) {
            $status = 'WARNING';
        }

        return [
            'status' => $status,
            'expired_alerts' => $expiredCount,
            'near_deadline_count' => count($nearDeadlineCount),
            'unread_notifications' => Notification::unread()->count(),
            'last_checked' => now()->toIso8601String(),
        ];
    }
}
