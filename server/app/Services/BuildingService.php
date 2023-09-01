<?php

namespace App\Services;

use Location\Coordinate;
use Location\Polygon;

class BuildingService {
    protected array $corners;

    public function from($building): static
    {
        $this->corners = $building['corners'];
        return $this;
    }

    public function getCornersPolygon(): Polygon
    {
        return $this->makePolygon($this->corners);
    }

    public function getArea(): float
    {
        $buildingPolygon = $this->getCornersPolygon();
        return $buildingPolygon->getArea();
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
