import { Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

export function renderShip() {
  const geometry = new SphereGeometry(15, 32, 16)
  const material = new MeshStandardMaterial({ color: 0x0000aa })
  return new Mesh(geometry, material)
}
