import { createFetch } from '@vueuse/core'

const fetchOptions: RequestInit = {
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Credentials': 'true'
  },
  credentials: 'include'
}
const useApiFetch = createFetch({ baseUrl: import.meta.env.VITE_API_URL, fetchOptions })
export const useFetch = createFetch({ baseUrl: import.meta.env.VITE_MAIN_URL, fetchOptions })
export default useApiFetch
