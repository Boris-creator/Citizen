import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const user = ref<unknown>(null)
  const appIsLoading = ref(true)
  return { user, appIsLoading }
})
