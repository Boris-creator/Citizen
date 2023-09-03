import { Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import type { Vector2Data } from '@/types/building'

export function renderShip() {
  const geometry = new SphereGeometry(15, 32, 16)
  const material = new MeshStandardMaterial({ color: 0x0000aa })
  const ship = new Mesh(geometry, material)
  const setShipPosition = (position: Vector2Data) => {
    ship.position.copy(new Vector3(position.x, 90, position.y))
  }

  return { ship, setShipPosition }
}
