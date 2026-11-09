<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\B3TransactionController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DomesticTransactionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SystemSettingController;
use App\Http\Controllers\Api\WasteCategoryController;
use App\Http\Controllers\Api\WasteSourceController;
use App\Http\Controllers\Api\GoogleSheetsSyncController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (LimbahApp GForms Edition - Public Access / Tanpa Login)
|--------------------------------------------------------------------------
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Google Forms / Google Sheets Sync Endpoints (Public Webhook & Manual Pull)
Route::prefix('sync')->group(function () {
    Route::post('/b3', [GoogleSheetsSyncController::class, 'syncB3']);
    Route::post('/domestic', [GoogleSheetsSyncController::class, 'syncDomestic']);
    Route::get('/pull', [GoogleSheetsSyncController::class, 'pullFromSheets']);
    Route::post('/pull', [GoogleSheetsSyncController::class, 'pullFromSheets']);
});

// Mock / Guest profile endpoint (agar frontend tetap kompatibel tanpa login)
Route::get('/me', function () {
    return response()->json([
        'status' => 'success',
        'user' => [
            'id' => 1,
            'name' => 'Operator EHS (GForms)',
            'email' => 'operator@ehs.local',
            'role' => 'ADMIN_EHS',
        ],
    ]);
});

// Waste Categories (read-only)
Route::apiResource('waste-categories', WasteCategoryController::class)->only(['index', 'show']);

// Waste Sources (Locations)
Route::apiResource('waste-sources', WasteSourceController::class)->only(['index', 'show']);

// B3 Transactions (Read-only via API, penambahan melalui Google Forms & Sheets)
Route::apiResource('b3-transactions', B3TransactionController::class)->only(['index', 'show']);

// Domestic Transactions (Read-only via API, penambahan melalui Google Forms & Sheets)
Route::apiResource('domestic-transactions', DomesticTransactionController::class)->only(['index', 'show']);

// Notifications
Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::post('{notification}/read', [NotificationController::class, 'markAsRead']);
});

// System Settings
Route::prefix('settings')->group(function () {
    Route::get('/', [SystemSettingController::class, 'index']);
    Route::post('/', [SystemSettingController::class, 'update']);
});

// Dashboard & Analytics
Route::prefix('dashboard')->group(function () {
    Route::get('/summary', [DashboardController::class, 'summary']);
    Route::get('/alerts', [DashboardController::class, 'alerts']);
    Route::post('/alerts/{alert}/acknowledge', [DashboardController::class, 'acknowledgeAlert']);
    Route::get('/health', [DashboardController::class, 'health']);
    Route::get('/near-deadline-warnings', [DashboardController::class, 'nearDeadlineWarnings']);
    Route::get('/expired-warnings', [DashboardController::class, 'expiredWarnings']);
    Route::get('/monthly-trends', [DashboardController::class, 'monthlyTrends']);
    Route::get('/trends', [DashboardController::class, 'monthlyTrends']);
    Route::get('/yearly-trends', [DashboardController::class, 'yearlyTrends']);
    Route::get('/category-breakdown', [DashboardController::class, 'categoryBreakdown']);
});

// Catch-all for undefined routes
Route::fallback(function () {
    return response()->json([
        'message' => 'Route not found',
        'status' => 404,
    ], 404);
});
