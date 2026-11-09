<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\GoogleSheetsSyncController;
use Illuminate\Console\Command;

class SyncGoogleSheetsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sheets:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync waste transactions from Google Sheets CSV endpoints';

    /**
     * Execute the console command.
     */
    public function handle(GoogleSheetsSyncController $syncController)
    {
        $this->info('Starting Google Sheets data synchronization...');

        $response = $syncController->pullFromSheets();
        $payload = $response->getData(true);

        if (($payload['status'] ?? '') === 'success') {
            $summary = $payload['summary'] ?? [];
            $this->info(sprintf(
                'Sync completed successfully! B3 records synced: %d, Domestic records synced: %d',
                $summary['b3_synced'] ?? 0,
                $summary['domestic_synced'] ?? 0
            ));

            if (!empty($summary['errors'])) {
                $this->warn('Warnings / Errors encountered during sync:');
                foreach ($summary['errors'] as $err) {
                    $this->error(" - {$err}");
                }
            }
        } else {
            $this->error('Failed to sync: ' . ($payload['message'] ?? 'Unknown error'));
        }

        return Command::SUCCESS;
    }
}
