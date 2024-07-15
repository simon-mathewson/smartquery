import type { Page } from '@playwright/test';

declare global {
  interface Window {
    navigatorCredentialsStoreCalls: unknown[];
    PasswordCredential: {
      new ({ id, password }: { id: string; password: string }): void;
    };
  }
}

export const mockStore = async (page: Page) => {
  await page.evaluate(() => {
    window.navigatorCredentialsStoreCalls = [];
    navigator.credentials.store = function (...args: unknown[]) {
      window.navigatorCredentialsStoreCalls.push(args);
      return Promise.resolve();
    };

    window.PasswordCredential = class {
      id: string;
      password: string;
      constructor({ id, password }: { id: string; password: string }) {
        this.id = id;
        this.password = password;
      }
    };
  });
};

export const getStoreCalls = async (page: Page) => {
  return page.evaluate(() => window.navigatorCredentialsStoreCalls);
};
