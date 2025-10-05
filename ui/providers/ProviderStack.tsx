import type { PropsWithChildren, ReactNode } from 'react';
import React, { useMemo } from 'react';

type ProviderProps = {
  children: ReactNode;
};

type ProviderComponent = React.ComponentType<ProviderProps>;

const composeProviders = (
  providers: Array<{ Provider: ProviderComponent; mockOverrides?: unknown }>,
  children: ReactNode,
): ReactNode =>
  providers.reduceRight(
    (acc, { Provider, mockOverrides }) => (
      <Provider {...(mockOverrides ? { overrides: mockOverrides } : {})}>{acc}</Provider>
    ),
    children,
  );

type ProviderStackProps<T extends Record<string, React.FC<PropsWithChildren>>> = {
  children: ReactNode;
  providers: T;
  mockOverrides?: Partial<Record<keyof T, unknown>>;
};

export const ProviderStack = React.memo(
  <T extends Record<string, React.FC<PropsWithChildren>>>({
    children,
    providers,
    mockOverrides,
  }: ProviderStackProps<T>) => {
    const providerArray = useMemo(
      () =>
        Object.entries(providers).map(([ProviderName, Provider]) => {
          const providerMockOverrides = mockOverrides?.[ProviderName as keyof T];

          return {
            Provider,
            mockOverrides: providerMockOverrides,
          };
        }),
      [providers, mockOverrides],
    );

    const composed = useMemo(
      () => composeProviders(providerArray, children),
      [providerArray, children],
    );
    return <>{composed}</>;
  },
);
