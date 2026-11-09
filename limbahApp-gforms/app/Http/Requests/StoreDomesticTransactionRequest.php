<?php

namespace App\Http\Requests;

use App\Models\DomesticTransaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDomesticTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->input('status', 'SUBMITTED'),
            'pic_name' => $this->input('pic_name', 'Petugas'),
        ]);
    }

    public function rules(): array
    {
        $detailRules = collect(DomesticTransaction::DETAIL_FIELDS)
            ->mapWithKeys(fn (string $field): array => [$field => ['nullable', 'numeric', 'min:0', 'max:999999.99']])
            ->all();

        return [
            'date' => ['required', 'date', 'before_or_equal:today'],
            'movement_type' => ['required', Rule::enum(\App\Enums\WasteMovementType::class)],
            'session' => ['required_if:movement_type,IN', 'nullable', Rule::enum(\App\Enums\WasteSession::class)],
            'processing_method' => ['required_if:movement_type,OUT', 'nullable', Rule::enum(\App\Enums\ProcessingMethod::class)],
            ...$detailRules,
            'status' => ['required', Rule::enum(\App\Enums\TransactionStatus::class)],
            'pic_name' => ['required', 'string', 'max:255'],
            'pic_phone' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $total = collect(DomesticTransaction::DETAIL_FIELDS)
                ->sum(fn (string $field): float => (float) $this->input($field, 0));

            if ($total <= 0) {
                $validator->errors()->add('total_weight_kg', 'Minimal satu jenis sampah harus memiliki nilai lebih dari 0.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'movement_type.required' => 'Jenis transaksi masuk/keluar wajib dipilih.',
            'session.required_if' => 'Sesi wajib dipilih untuk sampah masuk.',
            'processing_method.required_if' => 'Metode pengolahan wajib dipilih untuk sampah keluar.',
        ];
    }
}
