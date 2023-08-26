<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Building;

use Location\Coordinate;
use Location\Polygon;
use Location\Intersection;

class ValidateBuildingPosition
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $polygon = $this->makePolygon($request->input('corners'));

        if ($polygon -> getArea() >= 20000)
        {
            abort(Response::HTTP_BAD_REQUEST, 'Too large');
        }

        $buildings = Building::query()->get();
        foreach ($buildings as $building)
        {
            $buildingPolygon = $this->makePolygon($building['corners']);
            if ((new Intersection\Intersection())->intersects($polygon, $buildingPolygon, true))
            {
                abort(Response::HTTP_BAD_REQUEST, 'Respect your neighbours');
            }
        }

        return $next($request);
    }

    private function makePolygon(array $points): Polygon
    {
        $polygon = new Polygon();
        foreach ($points as $corner)
        {
            $polygon->addPoint(new Coordinate($corner['lat'], $corner['lng']));
        }
        return $polygon;
    }
}
