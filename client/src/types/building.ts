import LatLng = google.maps.LatLng

export type Vector2Data = { x: number; y: number }
export type BuildingData = {
  id: number | null
} & (
  | {
      type: 'box'
      size: {
        width: number
        height: number
        depth: number
      }
      position: {
        lat: number
        lng: number
        rotate: number
      }
    }
  | {
      type: 'polygon'
      corners: Array<Vector2Data>
      height: number
    }
)

export type StoredBuilding = {
  id: number
  position: LatLng
  corners: Array<LatLng>
  height: number
  floorsCount: number
}
