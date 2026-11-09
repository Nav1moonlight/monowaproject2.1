<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWasteSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:waste_sources,name'],
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
