<template>
  <div @resize="setSceneSize">
    <canvas ref="canvasElement" tabindex="0" />
  </div>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { createLights } from '@/services/light'
import { createControls } from '@/services/controls'
import { renderGround } from '@/services/ground'
import { THEMES } from '@/constants/themes'
import { renderBuildingInterior, deserializeBuilding } from '@/services/renderBuildingInterior'
import { computed, onMounted, ref, watch } from 'vue'
import { WebGLRenderer } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

import { useBuildingsStore } from '@/stores/buildings'

const buildingInterior = computed(() => useBuildingsStore().buildingInterior)
const scene = new THREE.Scene()
const renderer = ref<THREE.WebGLRenderer>()
const theme = THEMES.default

const MESH_NAME = 'interior'

const mousePosition = ref<THREE.Vector2>(new THREE.Vector2())
let controls: OrbitControls
let arrowControls: PointerLockControls

scene.background = new THREE.Color(theme.sky)
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100)
const raycaster = new THREE.Raycaster()
camera.position.set(0, 1.5, 6.5)
scene.add(camera)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const { ambientLight, mainLight } = createLights()
scene.add(ambientLight, mainLight)

const { ground, grid } = renderGround(theme)
scene.add(ground, ...grid)

function loop(renderer: WebGLRenderer) {
  requestAnimationFrame(() => {
    loop(renderer)
  })
  if (controls && !arrowControls?.isLocked) {
    controls.update()
  }

  renderer.render(scene, camera)
}

function setSceneSize() {
  const { width, height } = (canvasElement.value as HTMLCanvasElement).getBoundingClientRect()
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  ;(renderer.value as WebGLRenderer).setSize(width, height)
}

function mouseMoveHandler(event: MouseEvent) {
  const canvas = canvasElement.value as HTMLCanvasElement
  const { left, top, width, height } = canvas.getBoundingClientRect()

  mousePosition.value.x = ((event.clientX - left) / width) * 2 - 1
  mousePosition.value.y = -((event.clientY - top) / height) * 2 + 1
  raycaster.setFromCamera(mousePosition.value, camera)

  const intersects = raycaster.intersectObjects(scene.children, false)
  const interiorIntersection = intersects.find(
    (intersection) => intersection.object.name === MESH_NAME
  )
  if (!interiorIntersection) {
    return
  }
  const pointerControls = arrowControls as PointerLockControls
  if (!pointerControls.isLocked) {
    pointerControls.lock()
    camera.position.copy(interiorIntersection.point)
  }
}

onMounted(() => {
  const canvas = canvasElement.value as HTMLCanvasElement
  renderer.value = new THREE.WebGLRenderer({ canvas })
  setSceneSize()

  const { controls: threeOrbitControls, arrowControls: threeArrowControls } = createControls(
    camera,
    renderer.value.domElement,
    { avoidCollision: [MESH_NAME] }
  )
  controls = threeOrbitControls
  arrowControls = threeArrowControls

  loop(renderer.value)

  canvas.addEventListener('dblclick', mouseMoveHandler)
})

watch(buildingInterior, (interior) => {
  const interiorMesh = scene.getObjectByName(MESH_NAME)
  if (interiorMesh) {
    scene.remove(interiorMesh)
  }
  if (interior !== null) {
    scene.add(renderBuildingInterior(deserializeBuilding(interior), MESH_NAME))
  }
})
</script>
<style scoped lang="scss">
canvas {
  width: 50vw;
  height: 50vh;
}
</style>
