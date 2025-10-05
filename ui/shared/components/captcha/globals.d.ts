declare global {
  interface Window {
    AwsWafCaptcha?: {
      renderCaptcha: (
        container: Element,
        configuration: {
          apiKey: string;
          onSuccess: (wafToken: string) => void;
          onError?: (error: CatpchaError) => void;
          onLoad?: () => void;
          onPuzzleTimeout?: () => void;
          onPuzzleCorrect?: () => void;
          onPuzzleIncorrect?: () => void;
          defaultLocale?: string;
          dynamicWidth?: boolean;
          skipTitle?: boolean;
        },
      ) => void;
    };
    AwsWafIntegration?: {
      fetch: typeof fetch;
    };
  }
}

export {};
