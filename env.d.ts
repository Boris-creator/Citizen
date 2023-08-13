/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_ID: string
  readonly VITE_MAP_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
