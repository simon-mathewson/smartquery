declare global {
  interface NavigatorUAData {
    getHighEntropyValues(hints: string[]): Promise<{ [key: string]: string }>;
  }

  interface Navigator {
    userAgentData?: NavigatorUAData;
  }
}

export {};
