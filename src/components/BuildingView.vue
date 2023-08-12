<template>
  <div @resize="setSceneSize">
    <canvas ref="canvasElement" />
  </div>
</template>
<script setup lang="ts">
import * as THREE from 'three'
import { createLights } from '@/services/light'
import { createControls } from '@/services/controls'
import { ground, grid } from '@/services/ground'
import { THEMES } from '@/constants/themes'
import { renderBuilding, deserializeBuilding } from '@/services/renderBuilding'
import { computed, onMounted, ref, watch } from 'vue'
import { WebGLRenderer } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useBuildingsStore } from '@/stores/buildings'

const buildingInterior = computed(() => useBuildingsStore().buildingInterior)
const scene = new THREE.Scene()
const renderer = ref<THREE.WebGLRenderer>()
const theme = THEMES.ukrainianDay

const MESH_NAME = 'interior'

scene.background = new THREE.Color(theme.sky)
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 1.5, 6.5)
const canvasElement = ref<HTMLCanvasElement | null>(null)

const { ambientLight, mainLight } = createLights()
scene.add(ambientLight, mainLight)

scene.add(ground, ...grid)

function loop(renderer: WebGLRenderer, controls: OrbitControls) {
  requestAnimationFrame(() => {
    loop(renderer, controls)
  })
  controls.update()
  renderer.render(scene, camera)
}

function setSceneSize() {
  renderer.value.setSize(window.innerWidth / 2, window.innerHeight / 2)
}
onMounted(() => {
  renderer.value = new THREE.WebGLRenderer({ canvas: canvasElement.value as HTMLCanvasElement })
  setSceneSize()
  //document.body.appendChild( renderer.domElement );
  const controls = createControls(camera, renderer.value.domElement)
  loop(renderer.value, controls)
})

watch(buildingInterior, (interior) => {
  const interiorMesh = scene.getObjectByName(MESH_NAME)
  if (interiorMesh) {
    scene.remove(interiorMesh)
  }
  if (interior !== null) {
    scene.add(renderBuilding(deserializeBuilding(interior), MESH_NAME))
  }
})
</script>
