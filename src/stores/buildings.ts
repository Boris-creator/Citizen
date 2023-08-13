import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import buildingsData from '@/assets/data/buildings.json'
import interiorsData from '@/assets/data/interiors.json'
import type { BuildingSerialized } from '@/types/interior'
import type { BuildingData } from '@/types/building'

export const useBuildingsStore = defineStore('buildings', () => {
  const selectedBuilding = ref<BuildingData | null>(null)
  const buildings = ref(buildingsData as Array<BuildingData>)
  const setBuilding = (building: BuildingData | null) => {
    selectedBuilding.value = building
  }
  const addBuilding = (building: BuildingData) => {
    building.id = Math.max(...buildings.value.map(({ id }) => id)) + 1
    buildings.value.push(building)
  }

  const buildingInterior = computed<BuildingSerialized | null>(() => {
    return interiorsData.find((interior) => interior.id === selectedBuilding.value?.id) ?? null
  })
  return {
    selectedBuilding,
    buildings,
    buildingInterior,
    setBuilding,
    addBuilding
  }
})
