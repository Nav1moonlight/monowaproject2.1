<?php

namespace App\Http\Resources;

use App\Models\DomesticTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DomesticTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $details = collect(DomesticTransaction::DETAIL_FIELDS)
            ->mapWithKeys(fn (string $field): array => [$field => (float) $this->{$field}])
            ->all();

        return [
            'id' => $this->id,
            'date' => $this->date->format('Y-m-d'),
            'movement_type' => $this->movement_type,
            'session' => $this->session,
            'processing_method' => $this->processing_method,
            ...$details,
            'organic_weight_kg' => (float) $this->organic_weight_kg,
            'inorganic_weight_kg' => (float) $this->inorganic_weight_kg,
            'total_weight_kg' => (float) $this->total_weight_kg,
            'status' => $this->status,
            'pic_name' => $this->pic_name,
            'pic_phone' => $this->pic_phone,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ] : null,
            'updater' => $this->updater ? [
                'id' => $this->updater->id,
                'name' => $this->updater->name,
                'email' => $this->updater->email,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
