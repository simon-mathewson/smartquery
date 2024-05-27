/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LINK_S3_URL: string;
  readonly VITE_LINK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
