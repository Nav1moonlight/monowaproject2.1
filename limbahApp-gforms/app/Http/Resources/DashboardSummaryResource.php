<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'b3_total_weight_kg' => (float) $this['b3_total_weight_kg'],
            'b3_count_in' => (int) $this['b3_count_in'],
            'b3_count_out' => (int) $this['b3_count_out'],
            'b3_in_weight_kg' => (float) $this['b3_in_weight_kg'],
            'b3_out_weight_kg' => (float) $this['b3_out_weight_kg'],
            'b3_pending_count' => (int) $this['b3_pending_count'],
            'domestic_today_organic_kg' => (float) $this['domestic_today_organic_kg'],
            'domestic_today_inorganic_kg' => (float) $this['domestic_today_inorganic_kg'],
            'domestic_today_total_kg' => (float) $this['domestic_today_total_kg'],
            'storage_alerts_active' => (int) $this['storage_alerts_active'],
            'storage_alerts_expired' => (int) $this['storage_alerts_expired'],
            'notifications_unread' => (int) $this['notifications_unread'],
            'recent_b3_transactions' => B3TransactionResource::collection($this['recent_b3_transactions']),
            'recent_domestic_transactions' => DomesticTransactionResource::collection($this['recent_domestic_transactions']),
            'recent_alerts' => StorageAlertResource::collection($this['recent_alerts']),
        ];
    }
}
