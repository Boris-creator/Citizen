import type { BuildingData, Vector2Data } from '@/types/building'
import booleanIntersects from '@turf/boolean-intersects'
import { center, points, polygon } from '@turf/turf'

const pathToPoints = (path: Array<Vector2Data>) => path.map(({ x, y }) => [x, y])
const pathToPolygon = (path: Array<Vector2Data>) => pathToPoints([...path, path[0]])

export default function validateBuildingPosition(
  buildingCorners: Array<Vector2Data>,
  buildings: Array<BuildingData>
) {
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

export function getCenter(buildingCorners: Array<Vector2Data>): Vector2Data {
  const buildingCenter = center(points(pathToPoints(buildingCorners))).geometry.coordinates
  return { x: buildingCenter[0], y: buildingCenter[1] }
}
