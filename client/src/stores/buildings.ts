import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import buildingsData from '@/assets/data/buildings.json'
import type { BuildingSerialized } from '@/types/interior'
import type { BuildingData } from '@/types/building'
import useApiFetch from '@/composables/useApiFetch'
import { API_ROUTES } from '@/constants/api'

export const useBuildingsStore = defineStore('buildings', () => {
  const selectedBuilding = ref<BuildingData | null>(null)
  const buildings = ref(buildingsData as Array<BuildingData>)

  const buildingAction = ref<'destroy' | 'update' | 'interiors' | null>(null)

  const setBuilding = (building: BuildingData | null) => {
    selectedBuilding.value = building
  }
  const addBuilding = (building: BuildingData) => {
    buildings.value.push(building)
  }
  const destroyBuilding = (building = selectedBuilding.value) => {
    const buildingIdx = buildings.value.findIndex(({ id }) => id === building?.id)
    if (buildingIdx + 1) {
      buildings.value.splice(buildingIdx, 1)
    }
  }

  const { data: buildingInteriors, execute } = useApiFetch<Array<BuildingSerialized>>(
    () =>
      `${API_ROUTES.buildings.prefix}/${selectedBuilding.value?.id}${API_ROUTES.buildings.interiors}`,
    { immediate: false, initialData: [] }
  )
    .post()
    .json()

  const buildingInterior = computed<BuildingSerialized | null>(
    () => buildingInteriors.value[0] ?? null
  )

  watch(selectedBuilding, (value) => {
    if (value?.id) {
      execute()
    }
  })

  return {
    selectedBuilding,
    buildingAction,
    buildings,
    buildingInterior,
    setBuilding,
    addBuilding,
    destroyBuilding
  }
})
