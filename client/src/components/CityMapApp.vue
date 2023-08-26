<template>
  <div class="map__container">
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
</script>
<style scoped lang="scss">
.map__container {
  display: flex;
  > div {
    flex-grow: 1;
  }
}
</style>
