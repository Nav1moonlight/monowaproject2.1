<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DashboardSummaryResource;
use App\Http\Resources\StorageAlertResource;
use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DashboardController
{
    public function __construct(protected DashboardService $service) {}

    /**
     * Get dashboard summary with all KPIs
     */
    public function summary(Request $request): DashboardSummaryResource
    {
        // Check if filtering by date range
        if ($request->has('date_from') && $request->has('date_to')) {
            $from = Carbon::parse($request->input('date_from'));
            $to = Carbon::parse($request->input('date_to'));
            $summary = $this->service->getSummaryByDateRange($from, $to);
        } else {
            $summary = $this->service->getSummary();
        }

        return new DashboardSummaryResource($summary);
    }

    /**
     * Get all active storage alerts
     */
    public function alerts(Request $request): JsonResponse
    {
        $alerts = $this->service->getAlerts();

        return response()->json(['data' => $alerts]);
    }

    /**
     * Get health check status
     */
    public function health(): JsonResponse
    {
        $health = $this->service->getHealthStatus();

        return response()->json($health);
    }

    /**
     * Get near-deadline warnings
     */
    public function nearDeadlineWarnings(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);
        $warnings = $this->service->getNearDeadlineWarnings($days);

        return response()->json([
            'days' => $days,
            'count' => count($warnings),
            'warnings' => $warnings,
        ]);
    }

    /**
     * Get expired warnings (critical)
     */
    public function expiredWarnings(): JsonResponse
    {
        $warnings = $this->service->getExpiredWarnings();

        return response()->json([
            'count' => count($warnings),
            'warnings' => $warnings,
        ]);
    }

    /**
     * Get monthly trends
     */
    public function monthlyTrends(Request $request): JsonResponse
    {
        $months = $request->input('months', 12);
        $year = $request->input('year') ? (int) $request->input('year') : null;
        $trends = $this->service->getMonthlyTrends($months, $year);

        return response()->json([
            'months' => $months,
            'year' => $year,
            'trends' => $trends,
        ]);
    }

    /**
     * Get yearly trends (aggregated across years)
     */
    public function yearlyTrends(Request $request): JsonResponse
    {
        $years = (int) $request->input('years', 5);
        $trends = $this->service->getYearlyTrends($years);

        return response()->json([
            'years' => $years,
            'trends' => $trends,
        ]);
    }

    /**
     * Get category breakdown
     */
    public function categoryBreakdown(): JsonResponse
    {
        $breakdown = $this->service->getCategoryBreakdown();

        return response()->json([
            'categories' => $breakdown,
        ]);
    }

    /**
     * Acknowledge a storage alert
     */
    public function acknowledgeAlert(Request $request, \App\Models\StorageAlert $alert): JsonResponse
    {
        $userName = auth()->user()?->name ?? $request->input('acknowledged_by', 'Petugas EHS');
        $alert->acknowledge($userName);

        DashboardService::clearCache();

        return response()->json([
            'status' => 'success',
            'message' => 'Peringatan masa simpan telah ditandai sebagai ditindaklanjuti.',
            'data' => $alert,
        ]);
    }
}
