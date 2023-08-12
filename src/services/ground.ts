import * as THREE from 'three'
import { THEMES } from '@/constants/themes'

const WIDTH = 50
const theme = THEMES.ukrainianDay
const groundGeometry = new THREE.PlaneGeometry(WIDTH * 2, WIDTH * 2)
const groundMaterial = new THREE.MeshBasicMaterial({ color: theme.ground, side: THREE.DoubleSide })
export const ground = new THREE.Mesh(groundGeometry, groundMaterial)
ground.rotateX(-Math.PI * 0.5)
ground.position.set(0, 0, 0)

const lineMaterial = new THREE.LineBasicMaterial({ color: theme.sky })

export const grid: Array<THREE.Line> = []
for (let i = -WIDTH; i < WIDTH; i += 1.5) {
  const points = []
  points.push(new THREE.Vector3(i, 0, -WIDTH))
  points.push(new THREE.Vector3(i, 0, WIDTH))
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  const line = new THREE.Line(lineGeometry, lineMaterial)
  grid.push(line)
}
