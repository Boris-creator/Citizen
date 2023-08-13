import type { Building, BuildingSerialized } from '@/types/interior'
import { ExtrudeGeometry, Mesh, MeshStandardMaterial, Path, Shape, Vector2 } from 'three'
// @ts-ignore
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import * as THREE from 'three'

const toVector = (coords: number[]) => new Vector2(...coords)

export function deserializeBuilding(buildingData: BuildingSerialized): Building {
  return {
    ...buildingData,
    floors: buildingData.floors.map((floor) => ({
      ...floor,
      border: floor.border.map(toVector),
      walls: floor.walls.map((wall) => ({
        ...wall,
        start: toVector(wall.start),
        end: toVector(wall.end)
      }))
    }))
  }
}

export function renderBuildingInterior(building: Building, name = '') {
  const buildingBase = 0.1
  const floorLevels = building.floors
    .sort((floor1, floor2) => floor1.number - floor2.number)
    .reduce(
      (levels, floor) => {
        levels.levels[floor.number] = levels.baseLevel
        levels.baseLevel += floor.height
        return levels
      },
      {
        levels: {} as Record<number, number>,
        baseLevel: 0
      }
    ).levels
  const floorGeometries = building.floors.map((floor) => {
    const shapes: Array<ExtrudeGeometry> = []

    const floorShape = new Shape(building.floors[0].border)
    const geometry = new ExtrudeGeometry(floorShape, { depth: 0.05, bevelEnabled: false })
    geometry.rotateX(Math.PI / 2)
    geometry.translate(0, floorLevels[floor.number], 0)
    shapes.push(geometry)

    shapes.push(
      ...floor.walls.map((wall) => {
        const wallVector = wall.start.clone().sub(wall.end)
        const wallLength = wallVector.length()
        const wallHeight = floor.height
        const wallShape = new Shape([
          new Vector2(0, 0),
          new Vector2(wallLength, 0),
          new Vector2(wallLength, wallHeight),
          new Vector2(0, wallHeight)
        ])

        wall.windows.forEach((wallWindow) => {
          const { left, base, width, height } = wallWindow
          const windowPath = new Path()
          windowPath
            .moveTo(left, base + height)
            .lineTo(left + width, base + height)
            .lineTo(left + width, base)
            .lineTo(left, base)
          wallShape.holes.push(windowPath)
        })

        const wallGeometry = new ExtrudeGeometry(wallShape, { depth: 0.05, bevelEnabled: false })
        wallGeometry.rotateY(Math.PI - Math.atan2(wallVector.y, wallVector.x))
        wallGeometry.translate(wall.start.x, floorLevels[floor.number], wall.start.y)

        return wallGeometry
      })
    )

    return shapes
  })

  const geometry = BufferGeometryUtils.mergeGeometries(floorGeometries.flat())
  const material = new MeshStandardMaterial({
    color: 0xaabbdd,
    opacity: 0.85,
    transparent: true
  })
  const mesh = new Mesh(geometry, material)
  mesh.name = name
  const { min, max } = new THREE.Box3().setFromObject(mesh)
  geometry.translate(-(max.x - min.x) / 2, buildingBase, 0)
  return mesh
}
