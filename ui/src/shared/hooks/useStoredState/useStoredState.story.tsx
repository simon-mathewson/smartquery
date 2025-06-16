import { useEffectOnce } from '../useEffectOnce/useEffectOnce';
import { useStoredState } from './useStoredState';

export type UseStoredStateStoryProps = {
  changeValue?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: any;
  storage: 'session' | 'local';
  storageKey: string;
  useFunctionForDefaultValue?: boolean;
};

export const UseStoredStateStory: React.FC<UseStoredStateStoryProps> = (props) => {
  const { changeValue, defaultValue, storage, storageKey, useFunctionForDefaultValue } = props;

  const [state, setState] = useStoredState(
    storageKey,
    useFunctionForDefaultValue ? () => defaultValue : defaultValue,
    storage === 'session' ? sessionStorage : localStorage,
  );

  useEffectOnce(
    () => {
      setState('changedValue');
    },
    { enabled: changeValue === true },
  );

  return String(state);
};
