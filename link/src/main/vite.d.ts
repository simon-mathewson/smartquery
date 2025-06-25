/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_MYSQL_PORT: string;
  readonly VITE_PORT: string;
  readonly VITE_POSTGRESQL_PORT: string;
  readonly VITE_UI_URL: string;
  readonly VITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
