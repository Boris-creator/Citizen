<template>
  <div class="map">
    <button class="map__tools" @click="toggleMapInteractionMode">
      {{ mapInteractionMode ? 'Режим просмотра' : 'Добавить объект' }}
    </button>
    <div ref="mapElement" class="map__wrapper"></div>
  </div>
</template>
<script setup lang="ts">
import type { ThreeJSOverlayView } from '@googlemaps/three'
import * as THREE from 'three'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useBuildingsStore } from '@/stores/buildings'
import type { BuildingData, Vector2Data } from '@/types/building'
import { DEFAULT_BUILDING_HEIGHT, MAP_OPTIONS } from '@/constants/maps'
import LatLng = google.maps.LatLng
import { renderBuildingExterior } from '@/services/renderBuildingExterior'
import { initMap } from '@/services/initMap'
import DrawingManager = google.maps.drawing.DrawingManager
import validateBuildingPosition from '@/helpers/validateBuildingPosition'

const buildings: Map<`${number}`, BuildingData> = new Map()
const buildingsData = computed<Array<BuildingData>>(() => useBuildingsStore().buildings)

const mapElement = ref<HTMLElement | null>(null)
const drawingTools = ref<DrawingManager | null>(null)
const mapInteractionMode = computed({
  get() {
    return drawingTools.value?.getDrawingMode() ?? null
  },
  set(value) {
    if (drawingTools.value !== null) {
      drawingTools.value.setDrawingMode(value)
    }
  }
})
const toggleMapInteractionMode = () => {
  mapInteractionMode.value = mapInteractionMode.value
    ? null
    : google.maps.drawing.OverlayType.POLYGON
}

function renderBuildings(buildingsToRender: Array<BuildingData>, context: ThreeJSOverlayView) {
  buildingsToRender.forEach((building) => {
    const buildingId = `${building.id}` as `${number}`
    if (buildings.has(buildingId)) {
      return
    }
    const buildingMesh = renderBuildingExterior(building)

    buildings.set(buildingId, building)

    if (building.type === 'box') {
      buildingMesh.position.copy(context.latLngAltitudeToVector3(building.position))
    }
    context.scene.add(buildingMesh)
  })
  context.requestRedraw()
}

onMounted(async () => {
  const { context, drawer, selectedObjects } = await initMap(mapElement.value as HTMLElement)

  drawingTools.value = drawer

  renderBuildings(buildingsData.value, context)
  watchEffect(() => {
    renderBuildings(buildingsData.value, context)
  })
  watchEffect(() => {
    const selectedBuilding = buildings.get(selectedObjects.value[0]?.name as `${number}`) ?? null
    useBuildingsStore().setBuilding(selectedBuilding)
  })

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 50, 16, 2),
    new THREE.MeshMatcapMaterial()
  )
  const { min, max } = new THREE.Box3().setFromObject(column)
  const boxHeight = max.y - min.y
  column.geometry.translate(0, boxHeight / 2, 0)
  column.position.copy(context.latLngAltitudeToVector3(MAP_OPTIONS.center))
  context.scene.add(column)

  drawer.addListener('overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
    if (event.type !== 'polygon') {
      return
    }
    const polygon = event.overlay as google.maps.Polygon
    //@ts-ignore
    event.overlay.editable = false
    //@ts-ignore
    const coordinates = polygon.getPath().g as Array<LatLng>
    const path = coordinates.map((point) => {
      const vector3 = context.latLngAltitudeToVector3(point)
      return { x: vector3.x, y: vector3.z }
    })

    if (!validateBuildingPosition(path, buildingsData.value)) {
      polygon.setMap(null)
      return
    }

    const newBuilding: BuildingData = {
      type: 'polygon',
      corners: path,
      size: {
        height: DEFAULT_BUILDING_HEIGHT
      },
      id: null
    }
    useBuildingsStore().addBuilding(newBuilding)
  })
})
</script>
<style scoped lang="scss">
.map {
  position: relative;
  &__wrapper {
    width: 50vw;
    height: 50vh;
  }
  &__tools {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 1;
    padding: 0.5rem;
    cursor: pointer;
  }
}
</style>
