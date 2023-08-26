import { createFetch } from '@vueuse/core'

const useApiFetch = createFetch({ baseUrl: import.meta.env.VITE_API_URL })
export default useApiFetch
