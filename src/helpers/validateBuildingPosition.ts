import type { BuildingData, Vector2Data } from '@/types/building'
import booleanIntersects from '@turf/boolean-intersects'
import { polygon } from '@turf/turf'

export default function validateBuildingPosition(
  buildingCorners: Array<Vector2Data>,
  buildings: Array<BuildingData>
) {
  const pathToPolygon = (path: Array<Vector2Data>) => [...path, path[0]].map(({ x, y }) => [x, y])
  for (const existingBuilding of buildings) {
    if (existingBuilding.type === 'box') {
      continue
    }

    if (
      booleanIntersects(
        polygon([pathToPolygon(buildingCorners)]),
        polygon([pathToPolygon(existingBuilding.corners)])
      )
    ) {
      return false
    }
  }

  return true
}
