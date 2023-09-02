<template>
  <div class="map">
    <button class="map__tools" :disabled="isCreating" @click="toggleMapInteractionMode">
      {{ mapInteractionMode ? 'Режим просмотра' : 'Добавить объект' }}
    </button>
    <div ref="mapElement" class="map__wrapper"></div>
  </div>
</template>
<script setup lang="ts">
import type { ThreeJSOverlayView } from '@googlemaps/three'
import { computed, onBeforeMount, onMounted, ref, watch, watchEffect } from 'vue'
import { useBuildingsStore } from '@/stores/buildings'
import type { BuildingData, StoredBuilding } from '@/types/building'
import { DEFAULT_BUILDING_HEIGHT, MAP_OPTIONS, MAX_BUILDING_AREA } from '@/constants/maps'
import LatLng = google.maps.LatLng
import { renderBuildingExterior, renderPillar } from '@/services/renderBuildingExterior'
import { initMap } from '@/services/initMap'
import DrawingManager = google.maps.drawing.DrawingManager
import validateBuildingPosition from '@/helpers/validateBuilding'
import useApiFetch from '@/composables/useApiFetch'
import { API_ROUTES } from '@/constants/api'
import { renderShip } from '@/services/renderShip'

const buildings: Map<`${number}`, BuildingData> = new Map()

const { data: buildingsData, execute: searchBuildings } = useApiFetch<Array<StoredBuilding>>(
  API_ROUTES.buildings.prefix,
  { immediate: false, initialData: [] }
)
  .post()
  .json()
const newBuildingPayload = ref<Omit<StoredBuilding, 'id' | 'position'> | null>(null)
const {
  data: newBuilding,
  execute: createBuilding,
  onFetchError: onCreateError,
  isFetching: isCreating
} = useApiFetch<StoredBuilding>(`${API_ROUTES.buildings.prefix}${API_ROUTES.buildings.create}`, {
  immediate: false
})
  .post(newBuildingPayload)
  .json()

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

const setMapInteractionMode = (enabled: boolean) => {
  mapInteractionMode.value = enabled ? google.maps.drawing.OverlayType.POLYGON : null
}
const toggleMapInteractionMode = () => {
  setMapInteractionMode(mapInteractionMode.value === null)
}

function prepareBuildingCorners(points: LatLng[], context: ThreeJSOverlayView) {
  return points.map((point) => {
    const vector3 = context.latLngAltitudeToVector3(point)
    return { x: vector3.x, y: vector3.z }
  })
}
function prepareBuildingForRender(
  building: StoredBuilding,
  context: ThreeJSOverlayView
): BuildingData {
  return {
    ...building,
    type: 'polygon',
    corners: prepareBuildingCorners(building.corners, context)
  }
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

function validatePolygonArea(polygon: google.maps.Polygon) {
  return google.maps.geometry.spherical.computeArea(polygon.getPath()) <= MAX_BUILDING_AREA
}

onBeforeMount(() => {
  searchBuildings()
})

onMounted(async () => {
  const { context, drawer, selectedObjects } = await initMap(mapElement.value as HTMLElement)
  drawingTools.value = drawer

  const prepare = (building: StoredBuilding) => prepareBuildingForRender(building, context)

  const pillar = renderPillar()
  pillar.position.copy(context.latLngAltitudeToVector3(MAP_OPTIONS.center))
  context.scene.add(pillar)

  const ship = renderShip()
  ship.position.copy(context.latLngAltitudeToVector3(MAP_OPTIONS.center))
  ship.position.setY(90)
  context.scene.add(ship)

  let polygon: google.maps.Polygon | null = null
  onCreateError(() => {
    if (polygon) {
      polygon.setMap(null)
    }
  })

  drawer.addListener('overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
    if (event.type !== 'polygon') {
      return
    }
    polygon = event.overlay as google.maps.Polygon
    //@ts-ignore
    event.overlay.editable = false
    //@ts-ignore
    const coordinates = polygon.getPath().g as Array<LatLng>
    const path = prepareBuildingCorners(coordinates, context)
    if (
      !validateBuildingPosition(path, useBuildingsStore().buildings) ||
      !validatePolygonArea(polygon)
    ) {
      polygon.setMap(null)
      //return
    }

    newBuildingPayload.value = {
      corners: coordinates,
      height: DEFAULT_BUILDING_HEIGHT,
      floorsCount: 1
    }
  })

  watch(
    buildingsData,
    (buildings) => {
      renderBuildings(buildings.map(prepare), context)
      useBuildingsStore().buildings = buildings.map(prepare)
    },
    { deep: true, immediate: true }
  )

  watch(newBuilding, (building) => {
    renderBuildings([prepare(building)], context)
    useBuildingsStore().addBuilding(prepare(building))
  })

  watch(isCreating, (value) => {
    setMapInteractionMode(!value)
  })

  watchEffect(() => {
    const selectedBuilding = buildings.get(selectedObjects.value[0]?.name as `${number}`) ?? null
    useBuildingsStore().setBuilding(selectedBuilding)
  })
})

watch(newBuildingPayload, (value) => {
  if (value) {
    createBuilding()
  }
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
