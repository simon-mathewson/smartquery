export type MockProviderProps<T> = React.PropsWithChildren<{
  overrides?: Partial<T>;
}>;
