/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    handleRequest: (method: string, args: unknown[]) => Promise<unknown>;
  };
}
