import type { MockProvidersProps } from '~/providers/MockProviders';

export type StoryProps<T> = {
  propsOverrides?: Partial<T>;
  providerOverrides?: MockProvidersProps['mockOverrides'];
};
