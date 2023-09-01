<?php

namespace App\Http\Middleware;

use App\Services\BuildingService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Building;

use App\Services\BuildingBargainService;

use Location\Intersection;

class ValidateBuildingPosition
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): (Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $buildingService = (new BuildingService())->from($request);
        $polygon = $buildingService->getCornersPolygon();

        if ($buildingService->getArea() >= config('constants.MAX_BUILDING_SQUARE'))
        {
            abort(Response::HTTP_BAD_REQUEST, 'Too large');
        }

        $buildings = Building::query()->get();
        foreach ($buildings as $building)
        {
            $buildingPolygon = (new BuildingService())->from($building)->getCornersPolygon();
            if ((new Intersection\Intersection())->intersects($polygon, $buildingPolygon, true))
            {
                abort(Response::HTTP_BAD_REQUEST, 'Respect your neighbours');
            }
        }

        if (!BuildingBargainService::checkUserBalance(BuildingBargainService::getMarketPrice($buildingService->getArea()), $request->user()))
        {
            abort(Response::HTTP_BAD_REQUEST, 'Too expensive for you, looser');
        }

        return $next($request);
    }
}
