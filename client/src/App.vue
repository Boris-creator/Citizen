<template>
  <RouterView />
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onBeforeMount } from 'vue'
import useApiFetch, { useFetch } from '@/composables/useApiFetch'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const { execute: getToken } = useFetch('/sanctum/csrf-cookie', { immediate: false })
const {
  execute: login,
  data: user,
  onFetchResponse,
  onFetchFinally
} = useApiFetch('/login', { immediate: false })
  .post({
    email: 'qwerty@example.com',
    password: 'qwerty'
  })
  .json()

onFetchResponse(() => {
  store.user = user.value ?? null
})
onFetchFinally(() => {
  store.appIsLoading = false
})

onBeforeMount(async () => {
  await getToken()
  login()
})
</script>
