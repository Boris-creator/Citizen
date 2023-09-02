<?php

namespace App\Services;

use App\Models\Building;
use Location\Coordinate;
use Location\Polygon;

class BuildingService {

    public static function getCornersPolygon($building): Polygon
    {
        return self::makePolygon($building['corners']);
    }

    public static function getArea($building): float
    {
        $buildingPolygon = self::getCornersPolygon($building);
        return $buildingPolygon->getArea();
    }

    public static function findAll()
    {
        return Building::query()->get();
    }

    public static function findNearest($building)
    {
        $position = self::getPosition($building);
        $scopeRadius = 0.1;
        return Building::query()
            ->whereRaw(
                'ABS(JSON_EXTRACT(POSITION, "$.lat") - :lat) < 0.1 AND ABS(JSON_EXTRACT(POSITION, "$.lng") - :lng) < 0.1',
                ['lat' => $position['lat'], 'lng' => $position['lng']/*, 'scopeLat' => $scopeRadius, 'scopeLng' => $scopeRadius*/]
            )
            ->get();
    }

    public static function getPosition($building): array
    {
        $cornersPolygon = self::getCornersPolygon($building);
        $center = $cornersPolygon->getBounds()->getCenter();
        return [
            'lat' => $center->getLat(),
            'lng' => $center->getLng()
        ];
    }

    private static function makePolygon(array $points): Polygon
    {
        $polygon = new Polygon();
        foreach ($points as $corner)
        {
            $polygon->addPoint(new Coordinate($corner['lat'], $corner['lng']));
        }
        return $polygon;
    }
}
