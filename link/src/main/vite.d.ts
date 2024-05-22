/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_PORT: string;
  readonly VITE_UI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
