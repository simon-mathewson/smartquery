/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_DISCUSSIONS_URL: string;
  readonly VITE_MYSQL_PORT: string;
  readonly VITE_PORT: string;
  readonly VITE_POSTGRES_PORT: string;
  readonly VITE_UI_URL: string;
  readonly VITE_LINK_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
