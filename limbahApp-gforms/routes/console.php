<?php

use App\Services\B3TransactionService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('limbah:check-alerts')->dailyAt('07:00')->name('check-b3-storage-alerts');
Schedule::command('sheets:sync')->everyMinute()->name('sync-google-sheets-periodic');
