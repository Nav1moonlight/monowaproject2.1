<?php

namespace App\Console\Commands;

use App\Services\B3TransactionService;
use Illuminate\Console\Command;

class CheckB3Alerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'limbah:check-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Periksa tenggat waktu penyimpanan limbah B3 dan terbitkan notifikasi peringatan';

    /**
     * Execute the console command.
     */
    public function handle(B3TransactionService $service): int
    {
        $this->info('Memeriksa masa simpan limbah B3 (H-30, H-7, Expired)...');

        $alertsCreated = $service->checkAndCreateStorageAlerts();

        $this->info("Pengecekan selesai. {$alertsCreated} peringatan baru diterbitkan.");

        return Command::SUCCESS;
    }
}
