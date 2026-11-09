<?php

namespace App\Http\Requests;

use App\Models\DomesticTransaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDomesticTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $detailRules = collect(DomesticTransaction::DETAIL_FIELDS)
            ->mapWithKeys(fn (string $field): array => [$field => ['sometimes', 'numeric', 'min:0', 'max:999999.99']])
            ->all();

        return [
            'date' => ['sometimes', 'date', 'before_or_equal:today'],
            'movement_type' => ['sometimes', Rule::enum(\App\Enums\WasteMovementType::class)],
            'session' => ['nullable', Rule::enum(\App\Enums\WasteSession::class)],
            'processing_method' => ['nullable', Rule::enum(\App\Enums\ProcessingMethod::class)],
            ...$detailRules,
            'status' => ['sometimes', Rule::enum(\App\Enums\TransactionStatus::class)],
            'pic_name' => ['sometimes', 'string', 'max:255'],
            'pic_phone' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
