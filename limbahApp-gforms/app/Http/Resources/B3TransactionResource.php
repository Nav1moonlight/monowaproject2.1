<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class B3TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_type' => $this->transaction_type,
            'waste_category' => new WasteCategoryResource($this->whenLoaded('wasteCategory')),
            'waste_category_id' => $this->waste_category_id,
            'waste_code' => $this->waste_code,
            'waste_name' => $this->waste_name,
            'date' => $this->date->format('Y-m-d'),
            'source' => $this->source,
            'destination' => $this->destination,
            'transporter' => $this->transporter,
            'manifest_number' => $this->manifest_number,
            'weight_kg' => (float) $this->weight_kg,
            'remaining_weight_kg' => $this->remaining_weight_kg === null ? null : (float) $this->remaining_weight_kg,
            'status' => $this->status,
            'storage_deadline_at' => $this->storage_deadline_at?->toIso8601String(),
            'scale_photo_url' => $this->scale_photo_path
                ? (str_starts_with($this->scale_photo_path, 'http')
                    ? $this->scale_photo_path
                    : '/storage/' . ltrim($this->scale_photo_path, '/'))
                : null,
            'is_near_deadline' => $this->is_near_deadline ?? false,
            'is_expired' => $this->is_expired ?? false,
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
