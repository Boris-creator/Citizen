<template>
  <div class="map">
    <button class="map__tools" :disabled="isCreating" @click="toggleMapInteractionMode">
      {{ mapInteractionMode ? $t('map.menu.readonly') : $t('map.menu.add') }}
    </button>
    <building-menu v-show="isBuildingMenuVisible" />
    <div ref="mapElement" class="map__wrapper"></div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch, watchEffect } from 'vue'
import { useBuildingsStore } from '@/stores/buildings'
import type { BuildingData, StoredBuilding } from '@/types/building'
import { DEFAULT_BUILDING_HEIGHT, MAP_OPTIONS, MAX_BUILDING_AREA } from '@/constants/maps'
import LatLng = google.maps.LatLng
import { renderPillar } from '@/services/renderBuildingExterior'
import { initMap } from '@/services/initMap'
import DrawingManager = google.maps.drawing.DrawingManager
import validateBuildingPosition, { getCenter } from '@/utils/validateBuilding'
import useApiFetch from '@/composables/useApiFetch'
import { API_ROUTES } from '@/constants/api'
import { renderShip } from '@/services/renderShip'
import {
  prepareBuildingCorners,
  prepareBuildingForRender,
  renderBuildings
} from '@/services/renderBuildingOnMap'

import BuildingMenu from '@/components/BuildingMenu.vue'

const SHIP_NAME = 'ship'

const buildingStore = useBuildingsStore()
const buildings: Map<`${number}`, BuildingData> = new Map()

const mapContext: { map: google.maps.Map | null; context: any } = { map: null, context: null }

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
const { onFetchResponse: onDestroyed, execute: destroy } = useApiFetch<boolean>(
  () => `${API_ROUTES.buildings.prefix}/${buildingStore.selectedBuilding?.id}`,
  { immediate: false }
).delete()

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

const isBuildingMenuVisible = ref(false)

const setMapInteractionMode = (enabled: boolean) => {
  mapInteractionMode.value = enabled ? google.maps.drawing.OverlayType.POLYGON : null
}
const toggleMapInteractionMode = () => {
  setMapInteractionMode(mapInteractionMode.value === null)
}

function validatePolygonArea(polygon: google.maps.Polygon) {
  return google.maps.geometry.spherical.computeArea(polygon.getPath()) <= MAX_BUILDING_AREA
}

function destroyBuilding() {
  const { context, map } = mapContext
  if (!context || !map) {
    return
  }
  map.setZoom(MAP_OPTIONS.zoom)

  const { ship, setShipPosition } = renderShip()
  ship.name = SHIP_NAME
  setShipPosition(getCenter(buildingStore.selectedBuilding?.corners))
  context.scene.add(ship)
  setTimeout(() => {
    destroy()
  }, 2000)
}

onBeforeMount(() => {
  searchBuildings()
})

onMounted(async () => {
  const { context, map, drawer, selectedObjects } = await initMap(mapElement.value as HTMLElement)
  mapContext.map = map
  mapContext.context = context
  drawingTools.value = drawer

  const prepare = (building: StoredBuilding) => prepareBuildingForRender(building, context)

  const pillar = renderPillar()
  pillar.position.copy(context.latLngAltitudeToVector3(MAP_OPTIONS.center))
  context.scene.add(pillar)

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
    if (!validateBuildingPosition(path, buildingStore.buildings) || !validatePolygonArea(polygon)) {
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
      buildingStore.buildings = buildings.map(prepare)
    },
    { deep: true, immediate: true }
  )
  watch(
    buildingStore.buildings,
    () => {
      renderBuildings(buildingStore.buildings, context, buildings)
    },
    { deep: true, immediate: true }
  )

  watch(newBuilding, (building) => {
    renderBuildings([prepare(building)], context, buildings)
    buildingStore.addBuilding(prepare(building))
  })

  watch(isCreating, (value) => {
    setMapInteractionMode(!value)
  })

  watchEffect(() => {
    const selectedBuilding = buildings.get(selectedObjects.value[0]?.name as `${number}`) ?? null
    buildingStore.setBuilding(selectedBuilding)
    isBuildingMenuVisible.value = selectedBuilding !== null
  })
})

watch(newBuildingPayload, (value) => {
  if (value) {
    createBuilding()
  }
})

watch(
  () => buildingStore.buildingAction,
  (action) => {
    if (!buildingStore.selectedBuilding) {
      return
    }
    switch (action) {
      case 'destroy':
        destroyBuilding()
        break
    }
    buildingStore.buildingAction = null
  }
)

onDestroyed(() => {
  buildingStore.destroyBuilding()
  mapContext.context.scene.remove(mapContext.context.scene.getObjectByName(SHIP_NAME))
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
