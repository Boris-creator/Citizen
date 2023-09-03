<template>
  <div class="building-menu">
    <button
      v-for="{ action, label, disabled } of menuItems"
      :key="action"
      :disabled="disabled"
      class="building-menu__item"
      @click="store.buildingAction = action"
    >
      {{ label }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBuildingsStore } from '@/stores/buildings'

const store = useBuildingsStore()
const { t } = useI18n()

const menuItems = computed<Array<{ label: string; disabled?: boolean; action: string }>>(() => [
  { label: t('building.menu.update'), action: 'update', disabled: true },
  { label: t('building.menu.interiors'), action: 'interiors' },
  { label: t('building.menu.destroy'), action: 'destroy' }
])
</script>
<style scoped lang="scss">
.building-menu {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  z-index: 1;
  &__item {
    display: block;
    width: 100%;
    padding: 0.3rem;
    cursor: pointer;
    text-align: left;
  }
}
</style>
