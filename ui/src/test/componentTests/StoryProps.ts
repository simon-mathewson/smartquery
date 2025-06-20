import type { ProviderOverrides } from '~/providers/MockProviders';

export type StoryProps<T = never> = [T] extends [never]
  ? { providers?: ProviderOverrides }
  : { providers?: ProviderOverrides; props: T };
