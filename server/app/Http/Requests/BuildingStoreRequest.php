<?php

namespace App\Http\Requests;

use App\Services\BuildingBargainService;
use App\Services\BuildingService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

use Location\Intersection;

class BuildingStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
            'floorsCount.integer' => ''
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->count() > 0)
                {
                    return;
                }
                $buildingData = $this->request->all();
                $buildingArea = BuildingService::getArea($buildingData);
                $polygon = BuildingService::getCornersPolygon($buildingData);

                if ($buildingArea >= config('constants.MAX_BUILDING_SQUARE'))
                {
                    $validator->errors()->add(
                        'corners',
                        'Too large'
                    );
                    //abort(Response::HTTP_BAD_REQUEST, 'Too large');
                }

                //$buildings = BuildingService::findNearest($this->input('position'));
                $buildings = BuildingService::findNearest($buildingData);
                foreach ($buildings as $building)
                {
                    $buildingPolygon = BuildingService::getCornersPolygon($building);
                    if ((new Intersection\Intersection())->intersects($polygon, $buildingPolygon, true))
                    {
                        $validator->errors()->add(
                            'position',
                            'Respect your neighbours'
                        );
                        //abort(Response::HTTP_BAD_REQUEST, 'Respect your neighbours');
                    }
                }

                if (!BuildingBargainService::checkUserBalance(BuildingBargainService::getMarketPrice($buildingArea), $this->user()))
                {
                    $validator->errors()->add(
                        'position',
                        'Too expensive for you, looser'
                    );
                    //abort(Response::HTTP_BAD_REQUEST, 'Too expensive for you, looser');
                }
            }
        ];
    }
}
