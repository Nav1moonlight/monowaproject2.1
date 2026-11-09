<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreB3TransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->input('status', 'PENDING'),
        ]);
    }

    public function rules(): array
    {
        return [
            'transaction_type' => ['required', Rule::enum(\App\Enums\WasteMovementType::class)],
            'waste_category_id' => ['required', 'exists:waste_categories,id'],
            'waste_code' => ['required', 'string', 'max:50'],
            'waste_name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'source' => ['required_if:transaction_type,IN', 'nullable', 'string', 'max:255'],
            'destination' => ['required_if:transaction_type,OUT', 'nullable', 'string', 'max:255'],
            'transporter' => ['required_if:transaction_type,OUT', 'nullable', 'string', 'max:255'],
            'manifest_number' => [
                'required_if:transaction_type,OUT',
                'nullable',
                'string',
                'max:100',
                Rule::unique('b3_transactions', 'manifest_number')->whereNull('deleted_at'),
            ],
            'weight_kg' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'remaining_weight_kg' => ['required_if:transaction_type,OUT', 'nullable', 'numeric', 'min:0', 'max:999999.99'],
            'status' => ['required', Rule::enum(\App\Enums\B3TransactionStatus::class)],
            'storage_deadline_at' => ['required_if:transaction_type,IN', 'nullable', 'date', 'after:date'],
            'scale_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'transaction_type.required' => 'Jenis transaksi wajib dipilih.',
            'waste_category_id.required' => 'Kategori limbah wajib dipilih.',
            'source.required_if' => 'Sumber limbah wajib diisi untuk B3 Masuk.',
            'destination.required_if' => 'Tujuan penyerahan wajib diisi untuk B3 Keluar.',
            'transporter.required_if' => 'Nama pengangkut (Transporter) wajib diisi untuk B3 Keluar.',
            'manifest_number.required_if' => 'Nomor manifest wajib diisi untuk B3 Keluar.',
            'remaining_weight_kg.required_if' => 'Sisa limbah wajib diisi untuk B3 Keluar.',
            'storage_deadline_at.required_if' => 'Batas penyimpanan wajib diisi untuk B3 Masuk.',
            'manifest_number.unique' => 'Nomor dokumen/manifest sudah digunakan.',
            'scale_photo.max' => 'Ukuran foto maksimal 5 MB.',
        ];
    }
}
