import type { MockProvidersProps } from '~/providers/MockProviders';

export type StoryProps<T = never> = [T] extends [never]
  ? { providers?: MockProvidersProps['mockOverrides'] }
  : { providers?: MockProvidersProps['mockOverrides']; props: T };
