import type { BuildingData } from '@/types/building'
import {
  BoxGeometry,
  ExtrudeGeometry,
  Mesh,
  MeshStandardMaterial,
  Shape,
  Box3,
  Vector2
} from 'three'
import * as THREE from 'three'

export function renderBuildingExterior(building: BuildingData): THREE.Mesh {
  const material = new MeshStandardMaterial({
    color: 0xbbbbdd,
    opacity: 0.6,
    transparent: true
  })
  const { type } = building
  if (type === 'box') {
    const { size } = building
    const buildingMesh = new Mesh(new BoxGeometry(size.width, size.height, size.depth), material)
    const { min: buildingMin } = new Box3().setFromObject(buildingMesh)
    const buildingHeight = buildingMin.y - buildingMin.y

    buildingMesh.geometry.translate(0, buildingHeight / 2, 0).scale(2, 2, 2)
    buildingMesh.rotateY(Math.PI * building.position.rotate)
    return buildingMesh
  }

  const corners = new Shape(building.corners.map(({ x, y }) => new Vector2(x, y)))
  const buildingGeometry = new ExtrudeGeometry(corners, {
    depth: building.height,
    bevelEnabled: false
  })
  buildingGeometry.rotateX(Math.PI / 2)
  const buildingMesh = new Mesh(buildingGeometry, material)
  buildingMesh.translateY(building.height)

  buildingMesh.name = `${building.id}`

  return buildingMesh
}

export function renderPillar() {
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 50, 16, 2),
    new THREE.MeshMatcapMaterial()
  )
  const { min, max } = new THREE.Box3().setFromObject(pillar)
  const boxHeight = max.y - min.y
  pillar.geometry.translate(0, boxHeight / 2, 0)
  return pillar
}
