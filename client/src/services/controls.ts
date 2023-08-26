import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import * as THREE from 'three'
import { onKeyStroke } from '@vueuse/core'

type Direction = 'forward' | 'backward' | 'right' | 'left'

function createControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  options: { avoidCollision: string[] }
) {
  const delta = 0.1

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2.1
  controls.minDistance = 2
  controls.maxDistance = 50

  const arrowControls = new PointerLockControls(camera, canvas)

  const raycaster = new THREE.Raycaster(
    camera.position.clone(),
    new THREE.Vector3(0, -1, 0),
    0,
    delta
  )

  let cameraLastPosition = camera.position

  arrowControls.addEventListener('lock', () => {
    cameraLastPosition = camera.position
    controls.saveState()
    controls.enabled = false
  })
  arrowControls.addEventListener('unlock', () => {
    camera.position.copy(cameraLastPosition)
    controls.reset()
    controls.enabled = true
  })

  const arrowOptions = { target: canvas }
  const directionKeys: Record<Direction, Array<KeyboardEvent['code']>> = {
    forward: ['w', 'W', 'ArrowUp'],
    backward: ['s', 'S', 'ArrowDown'],
    right: ['d', 'D', 'ArrowRight'],
    left: ['a', 'A', 'ArrowLeft']
  }

  onKeyStroke(
    [
      ...directionKeys.forward,
      ...directionKeys.backward,
      ...directionKeys.left,
      ...directionKeys.right
    ],
    (event) => {
      const direction = Object.keys(directionKeys).find((dir) =>
        directionKeys[dir as Direction].includes(event.code)
      ) as Direction
      raycaster.ray.origin.copy(camera.position.clone())
      camera.getWorldDirection(raycaster.ray.direction)
      if (direction === 'backward') {
        raycaster.ray.direction.setLength(-1)
        // we can instead use:
        // raycaster.ray.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
      }
      if (direction === 'right') {
        raycaster.ray.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
      }
      if (direction === 'left') {
        raycaster.ray.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * (3 / 2))
      }
      raycaster.ray.origin.add(raycaster.ray.direction.setLength(camera.near))
      if (
        raycaster
          .intersectObjects(camera.parent?.children ?? [])
          .find((int) => options.avoidCollision.includes(int.object.name))
      ) {
        return
      }
      switch (direction) {
        case 'forward':
          arrowControls.moveForward(delta)
          break
        case 'backward':
          arrowControls.moveForward(-delta)
          break
        case 'right':
          arrowControls.moveRight(delta)
          break
        case 'left':
          arrowControls.moveRight(-delta)
          break
        //TODO: collision check while collateral moving
      }
    },
    arrowOptions
  )

  return { controls, arrowControls }
}

export { createControls }
