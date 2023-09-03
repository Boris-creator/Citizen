<?php

namespace App\Http\Controllers;

use App\Http\Requests\BuildingStoreRequest;
use App\Models\BuildingBargain;
use App\Services\BuildingService;
use Illuminate\Http\JsonResponse;
use App\Models\Building;

use App\Services\BuildingBargainService;

class BuildingController extends Controller
{
    public static function create(BuildingStoreRequest $building): JsonResponse {
        $newBuilding = Building::query()->create([
            'position' => BuildingService::getPosition($building),
            'corners' => $building['corners'],
            'height' => $building['height'],
            'floorsCount' => $building['floorsCount'],
            'name' => $building['name'],
            'user_id' => request()->user()->id
        ]);

        $buildingArea = BuildingService::getArea($newBuilding);
        BuildingBargainService::makeLandBargain(
            $newBuilding,
            BuildingBargainService::getMarketPrice($buildingArea),
            ['buyer' => request() -> user()]
        );

        return response()->json($newBuilding);
    }

    public static function search(): JsonResponse {
        return response()->json(BuildingService::findAll());
    }

    public static function destroy(int $buildingId): JsonResponse {
        return response()->json(BuildingService::destroy($buildingId));
    }

    public static function getInteriors(int $buildingId): JsonResponse
    {
        $building = Building::query()->find($buildingId);
        return response()->json($building ? $building->interiors : []);
    }
}
