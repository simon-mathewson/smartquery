import { useEffectOnce, type UseEffectOnceOptions } from './useEffectOnce';

export type UseEffectOnceStoryProps = {
  effect: React.EffectCallback;
  options?: UseEffectOnceOptions;
};

export const UserEffectOnceStory: React.FC<UseEffectOnceStoryProps> = (props) => {
  useEffectOnce(props.effect, props.options);

  return null;
};
