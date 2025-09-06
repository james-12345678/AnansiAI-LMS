/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENVIRONMENT: string;
  readonly VITE_PLATFORM_NAME: string;
  readonly VITE_PLATFORM_VERSION: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_AUTH_TIMEOUT: string;
  readonly VITE_TOKEN_REFRESH_INTERVAL: string;
  readonly VITE_FORCE_CLOUD_MODE: string;
  readonly VITE_FORCE_BACKEND: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
