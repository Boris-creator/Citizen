import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import buildingsData from '@/assets/data/buildings.json'
import interiorsData from '@/assets/data/interiors.json'
import type { BuildingSerialized } from '@/types/interior'
import type { BuildingData } from '@/types/building'
import useApiFetch from '@/composables/useApiFetch'
import { API_ROUTES } from '@/constants/api'

export const useBuildingsStore = defineStore('buildings', () => {
  const selectedBuilding = ref<BuildingData | null>(null)
  const buildings = ref(buildingsData as Array<BuildingData>)
  const setBuilding = (building: BuildingData | null) => {
    selectedBuilding.value = building
  }
  const addBuilding = (building: BuildingData) => {
    buildings.value.push(building)
  }

  const { data: buildingInteriors, execute } = useApiFetch<Array<BuildingSerialized>>(
    () =>
      `${API_ROUTES.buildings.prefix}/${selectedBuilding.value?.id}${API_ROUTES.buildings.interiors}`,
    { immediate: false, initialData: interiorsData }
  )
    .post()
    .json()

  const buildingInterior = computed<BuildingSerialized>(
    () => buildingInteriors.value[0] ?? interiorsData[0]
  )

  watch(selectedBuilding, (value) => {
    if (value?.id) {
      execute()
    }
  })

  return {
    selectedBuilding,
    buildings,
    buildingInterior,
    setBuilding,
    addBuilding
  }
})
