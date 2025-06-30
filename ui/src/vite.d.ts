/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ABOUT_URL: string;
  readonly VITE_CLOUD_URL: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_LINK_S3_URL: string;
  readonly VITE_LINK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
