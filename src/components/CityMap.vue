<template>
  <div ref="mapElement" class="map__wrapper"></div>
</template>
<script setup lang="ts">
import { Loader } from '@googlemaps/js-api-loader'
import { ThreeJSOverlayView } from '@googlemaps/three'
import * as THREE from 'three'
import { computed, onMounted, ref } from 'vue'
import { useBuildingsStore } from '@/stores/buildings'
import type { BuildingData } from '@/types/building'
import { MAP_OPTIONS } from '@/constants/maps'

const buildingsData = computed<Array<BuildingData>>(() => useBuildingsStore().buildings)

const loader = new Loader({
  apiKey: '',
  version: 'weekly',
  libraries: ['places']
})
let map: google.maps.Map

const mapElement = ref<HTMLElement | null>(null)
async function initMap(): Promise<void> {
  const { Map: GoogleMap } = await loader.importLibrary('maps')

  //map = new Map(document.getElementById("map") as HTMLElement, mapOptions);
  map = new GoogleMap(mapElement.value as HTMLElement, MAP_OPTIONS)

  const overlay = new ThreeJSOverlayView({
    map,
    //upAxis: "Y",
    anchor: MAP_OPTIONS.center
  })

  overlay.setUpAxis(new THREE.Vector3(0, 1, 0))
  overlay.setMap(map)
  overlay.onRemove = () => {
    google.maps.event.trigger(map, 'idle')
  }

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 50, 16, 2),
    new THREE.MeshMatcapMaterial()
  )
  const { min, max } = new THREE.Box3().setFromObject(column)
  const boxHeight = max.y - min.y

  column.geometry.translate(0, boxHeight / 2, 0)

  column.position.copy(overlay.latLngAltitudeToVector3(MAP_OPTIONS.center))

  overlay.scene.add(column)
  const buildings: Map<`${number}`, BuildingData> = new Map()
  buildingsData.value.forEach((building) => {
    const { size, position } = building
    const buildingMesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.width, size.height, size.depth),
      new THREE.MeshMatcapMaterial()
    )
    buildingMesh.name = `${building.id}`
    buildings.set(`${building.id}`, building)
    const { min: buildingMin } = new THREE.Box3().setFromObject(buildingMesh)
    const buildingHeight = buildingMin.y - buildingMin.y

    buildingMesh.geometry.translate(0, buildingHeight / 2, 0).scale(2, 2, 2)
    buildingMesh.position.copy(overlay.latLngAltitudeToVector3(position))
    buildingMesh.rotateY(Math.PI * position.rotate)
    overlay.scene.add(buildingMesh)
  })

  const mapDiv = map.getDiv()

  map.addListener('click', (ev: unknown) => {
    // @ts-ignore
    const { domEvent, latLng } = ev
    const { left, top, width, height } = mapDiv.getBoundingClientRect()
    const x = domEvent.clientX - left
    const y = domEvent.clientY - top
    const mousePosition = new THREE.Vector2(2 * (x / width) - 1, 1 - 2 * (y / height))
    //console.log(mousePosition.sub(new THREE.Vector2(box.position.x, box.position.z)).length())
    //console.log(latLng.lat(), latLng.lng(), overlay.scene.children)

    const currentBuildings = overlay.raycast(mousePosition, buildings)

    const selectedBuilding = buildings.get(currentBuildings[0]?.object.name) ?? null
    useBuildingsStore().setBuilding(selectedBuilding)

    overlay.requestRedraw()
  })
}
onMounted(initMap)
</script>
<style scoped lang="scss">
.map__wrapper {
  width: 50vw;
  height: 50vh;
}
</style>
