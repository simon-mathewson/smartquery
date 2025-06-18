import type { MockProvidersProps } from '~/providers/MockProviders';

export type StoryProps<T = Record<string, never>> = {
  propsOverrides?: Partial<T>;
  providerOverrides?: MockProvidersProps['mockOverrides'];
};
