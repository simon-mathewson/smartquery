/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ABOUT_URL: string;
  readonly VITE_AWS_WAF_CAPTCHA_SCRIPT_URL?: string;
  readonly VITE_AWS_WAF_CAPTCHA_API_KEY?: string;
  readonly VITE_CLOUD_URL: string;
  readonly VITE_GITHUB_DISCUSSIONS_URL: string;
  readonly VITE_GOOGLE_ANALYTICS_ID: string;
  readonly VITE_IMPRINT_URL: string;
  readonly VITE_LINK_S3_URL: string;
  readonly VITE_LINK_URL: string;
  readonly VITE_PRIVACY_URL: string;
  readonly VITE_TERMS_URL: string;
  readonly VITE_UI_URL: string;
  readonly VITE_UI_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
