<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BuildingStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'position.lat' => 'required|numeric',
            'position.lng' => 'required|numeric',
            'corners.*.lat' => 'required|numeric',
            'corners.*.lng' => 'required|numeric',
            'height' => 'required|integer|min:0',
            'floorsCount' => 'required|integer|min:1',
            'name' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'floorsCount.integer' => 'you died'
        ];
    }
}
