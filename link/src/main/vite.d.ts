/// <reference types="electron-vite/node" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: string;
  readonly VITE_UI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
