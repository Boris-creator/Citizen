<template>
  <div v-if="!useAppStore().appIsLoading" class="map__container">
    <div>
      <city-map />
    </div>
    <div>
      <building-view />
    </div>
  </div>
</template>
<script setup lang="ts">
import CityMap from '@/components/CityMap.vue'
import BuildingView from '@/components/BuildingView.vue'
import { useAppStore } from '@/stores/app'
</script>
<style scoped lang="scss">
.map__container {
  display: flex;
  > div {
    flex-grow: 1;
  }
}
</style>
