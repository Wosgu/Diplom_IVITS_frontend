/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL_ENDPOINTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}