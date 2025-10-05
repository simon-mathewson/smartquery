import type { TestAppOptions } from './TestApp';

export type StoryProps<T = never> = [T] extends [never]
  ? { testApp?: TestAppOptions }
  : { testApp?: TestAppOptions; componentProps: T };
