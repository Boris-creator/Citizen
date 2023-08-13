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
      corners: Array<{ x: number; y: number }>
      size: {
        height: number
      }
    }
)
