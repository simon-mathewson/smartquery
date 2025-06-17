import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

export function useBuildProviders<T extends Record<string, React.FC<PropsWithChildren>>>(
  providers: T,
  children: React.ReactNode,
  mockOverrides?: Partial<Record<keyof T, unknown>>,
) {
  return useMemo(
    () =>
      Object.entries(providers)
        .reverse()
        .reduce(
          (Acc, [ProviderName, Provider]) => {
            const providerMockOverrides = mockOverrides?.[ProviderName as keyof T];

            return () => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <Provider {...(providerMockOverrides ? ({ providerMockOverrides } as any) : {})}>
                {Acc === null ? children : <Acc />}
              </Provider>
            );
          },
          null as React.FC<PropsWithChildren> | null,
        ),
    [children, mockOverrides, providers],
  );
}
