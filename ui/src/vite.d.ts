/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AWS_COGNITO_IDENTITY_POOL_ID?: string;
  readonly VITE_AWS_PINPOINT_APP_ID?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_LINK_S3_URL: string;
  readonly VITE_LINK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
