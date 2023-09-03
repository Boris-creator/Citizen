import { ThreeJSOverlayView } from '@googlemaps/three'
import type { BuildingData, StoredBuilding } from '@/types/building'
import { renderBuildingExterior } from '@/services/renderBuildingExterior'
import LatLng = google.maps.LatLng

export function prepareBuildingCorners(points: LatLng[], context: ThreeJSOverlayView) {
  return points.map((point) => {
    const vector3 = context.latLngAltitudeToVector3(point)
    return { x: vector3.x, y: vector3.z }
  })
}
export function prepareBuildingForRender(
  building: StoredBuilding,
  context: ThreeJSOverlayView
): BuildingData {
  return {
    ...building,
    type: 'polygon',
    corners: prepareBuildingCorners(building.corners, context)
  }
}

export function renderBuildings(
  buildingsToRender: Array<BuildingData>,
  context: ThreeJSOverlayView,
  buildings: Map<`${number}`, BuildingData>
) {
  buildingsToRender.forEach((building) => {
    const buildingId = `${building.id}` as `${number}`
    if (buildings.has(buildingId)) {
      return
    }
    const buildingMesh = renderBuildingExterior(building)

    buildings.set(buildingId, building)

    if (building.type === 'box') {
      buildingMesh.position.copy(context.latLngAltitudeToVector3(building.position))
    }
    context.scene.add(buildingMesh)
  })
  ;[...buildings.keys()].forEach((buildingId) => {
    if (!buildingsToRender.some(({ id }) => `${id}` === buildingId)) {
      context.scene.remove(context.scene.getObjectByName(buildingId))
    }
  })
  context.requestRedraw()
}
