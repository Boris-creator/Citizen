/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_ID: string
  readonly VITE_MAP_API_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_MAIN_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
