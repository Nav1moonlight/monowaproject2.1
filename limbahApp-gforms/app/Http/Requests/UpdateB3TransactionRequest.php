<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateB3TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $transactionId = $this->route('b3_transaction')?->id ?? $this->route('b3_transaction');

        return [
            'transaction_type' => ['sometimes', Rule::enum(\App\Enums\WasteMovementType::class)],
            'waste_category_id' => ['sometimes', 'exists:waste_categories,id'],
            'waste_code' => ['sometimes', 'string', 'max:50'],
            'waste_name' => ['sometimes', 'string', 'max:255'],
            'date' => ['sometimes', 'date', 'before_or_equal:today'],
            'source' => ['nullable', 'string', 'max:255'],
            'destination' => ['nullable', 'string', 'max:255'],
            'transporter' => ['nullable', 'string', 'max:255'],
            'manifest_number' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('b3_transactions', 'manifest_number')->ignore($transactionId)->whereNull('deleted_at'),
            ],
            'weight_kg' => ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'],
            'remaining_weight_kg' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'status' => ['sometimes', Rule::enum(\App\Enums\B3TransactionStatus::class)],
            'storage_deadline_at' => ['nullable', 'date'],
            'scale_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
