declare global {
  interface Navigator {
    userAgentData?: {
      getHighEntropyValues: (
        hints: string[]
      ) => Promise<{ [key: string]: string }>;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_DESKTOP_VERSION: string;
      NEXT_PUBLIC_DESKTOP_S3_URL: string;
      NEXT_PUBLIC_IOS_APP_STORE_URL: string;
    }
  }
}

export {};
