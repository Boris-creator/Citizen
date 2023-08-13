import * as THREE from 'three'
import type { BuildingData } from '@/types/building'
import { ExtrudeGeometry, Mesh, MeshStandardMaterial, Shape, Vector2 } from 'three'

export function renderBuildingExterior(building: BuildingData) {
  const material = new MeshStandardMaterial({
    color: 0xbbbbdd,
    opacity: 0.6,
    transparent: true
  })
  const { size, position, type } = building
  if (type === 'box') {
    const buildingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.width, size.height, size.depth),
      material
    )
    buildingMesh.name = `${building.id}`
    const { min: buildingMin } = new THREE.Box3().setFromObject(buildingMesh)
    const buildingHeight = buildingMin.y - buildingMin.y

    buildingMesh.geometry.translate(0, buildingHeight / 2, 0).scale(2, 2, 2)
    buildingMesh.rotateY(Math.PI * position.rotate)
    return buildingMesh
  }
  if (type === 'polygon') {
    const corners = new Shape(building.corners.map(({ x, y }) => new Vector2(x, y)))
    const buildingGeometry = new ExtrudeGeometry(corners, {
      depth: building.size.height,
      bevelEnabled: false
    })
    buildingGeometry.rotateX(Math.PI / 2)
    const buildingMesh = new Mesh(buildingGeometry, material)
    buildingMesh.translateY(building.size.height)
    return buildingMesh
  }
}