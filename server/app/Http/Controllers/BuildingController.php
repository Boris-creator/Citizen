<?php

namespace App\Http\Controllers;

use App\Http\Requests\BuildingStoreRequest;
use Illuminate\Http\JsonResponse;
use App\Models\Building;

class BuildingController extends Controller
{
    public static function create(BuildingStoreRequest $building): JsonResponse {
        $newBuilding = Building::query()->create([
            'position' => $building['position'],
            'corners' => $building['corners'],
            'height' => $building['height'],
            'floorsCount' => $building['floorsCount'],
            'name' => $building['name']
        ]);

        return response()->json($newBuilding);
    }

    public static function search(): JsonResponse {
        return response()->json(Building::query()->get());
    }

    public static function getInteriors(int $buildingId): JsonResponse
    {
        return response()->json(Building::query()->find($buildingId)->interiors);
    }
}
