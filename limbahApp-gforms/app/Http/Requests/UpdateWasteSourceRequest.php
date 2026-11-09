<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWasteSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $sourceId = $this->route('waste_source') instanceof \App\Models\WasteSource
            ? $this->route('waste_source')->id
            : $this->route('waste_source');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('waste_sources', 'name')->ignore($sourceId)],
            'code' => ['nullable', 'string', 'max:50'],
            'entity' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lokasi sumber limbah wajib diisi.',
            'name.unique' => 'Nama lokasi sumber limbah sudah terdaftar.',
            'name.max' => 'Nama lokasi maksimal 255 karakter.',
        ];
    }
}
