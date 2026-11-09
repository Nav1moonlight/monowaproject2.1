<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorageAlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'b3_transaction' => new B3TransactionResource($this->b3Transaction),
            'alert_type' => $this->alert_type,
            'deadline_at' => $this->deadline_at->toIso8601String(),
            'is_active' => $this->is_active,
            'is_expired' => $this->deadline_at->isPast(),
            'days_until_deadline' => $this->deadline_at->diffInDays(now(), false),
            'triggered_at' => $this->triggered_at?->toIso8601String(),
            'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
            'acknowledged_by' => $this->acknowledged_by,
            'notes' => $this->notes,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
