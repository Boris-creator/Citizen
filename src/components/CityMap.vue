<template>
  <div ref="mapElement" class="map__wrapper"></div>
</template>
<script setup lang="ts">
import type { ThreeJSOverlayView } from '@googlemaps/three'
import * as THREE from 'three'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useBuildingsStore } from '@/stores/buildings'
import type { BuildingData } from '@/types/building'
import { DEFAULT_BUILDING_HEIGHT, MAP_OPTIONS } from '@/constants/maps'

import LatLng = google.maps.LatLng
import { renderBuildingExterior } from '@/services/renderBuildingExterior'
import { initMap } from '@/services/initMap'

const buildings: Map<`${number}`, BuildingData> = new Map()
const buildingsData = computed<Array<BuildingData>>(() => useBuildingsStore().buildings)

const mapElement = ref<HTMLElement | null>(null)

function renderBuildings(buildingsToRender: Array<BuildingData>, context: ThreeJSOverlayView) {
  buildingsToRender.forEach((building) => {
    const buildingId = `${building.id}`
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
  renderBuildings(buildingsData.value, context)
  watchEffect(() => {
    renderBuildings(buildingsData.value, context)
  })
  watchEffect(() => {
    const selectedBuilding = buildings.get(selectedObjects.value[0]?.name) ?? null
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

  drawer.addListener('overlaycomplete', (event) => {
    if (event.type !== 'polygon') {
      return
    }
    event.overlay.editable = false
    const coordinates = event.overlay.getPath().g as Array<LatLng>
    const path = coordinates.map((point) => {
      const vector3 = context.latLngAltitudeToVector3(point)
      return { x: vector3.x, y: vector3.z }
    })
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
.map__wrapper {
  width: 50vw;
  height: 50vh;
}
</style>
