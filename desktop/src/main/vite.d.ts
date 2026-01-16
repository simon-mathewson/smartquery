/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_DESKTOP_VERSION: string;
  readonly VITE_DISCORD_INVITE_URL: string;
  readonly VITE_KEYCHAIN_SERVICE_NAME: string;
  readonly VITE_MYSQL_PORT: string;
  readonly VITE_PORT: string;
  readonly VITE_POSTGRES_PORT: string;
  readonly VITE_UI_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
