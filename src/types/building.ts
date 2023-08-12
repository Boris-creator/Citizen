export type BuildingData = {
  id: number
  position: {
    lat: number
    lng: number
    rotate: number
  }
} & {
  type: 'box'
  size: {
    width: number
    height: number
    depth: number
  }
}
