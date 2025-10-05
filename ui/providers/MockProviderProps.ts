import type { DeepPartial, ValueOf } from 'ts-essentials';
import type { ContextTypes } from './ContextTypes';

export type MockProviderProps<T extends ValueOf<ContextTypes>> = React.PropsWithChildren<{
  overrides?: DeepPartial<T>;
}>;
