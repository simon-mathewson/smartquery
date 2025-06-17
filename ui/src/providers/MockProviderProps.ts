export type MockProviderProps<T> = React.PropsWithChildren<{
  mockOverride?: Partial<T>;
}>;
