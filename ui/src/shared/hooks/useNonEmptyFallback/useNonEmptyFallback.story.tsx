import { useNonEmptyFallback } from './useNonEmptyFallback';

export type UseNonEmptyFallbackStoryProps = {
  value: unknown;
};

export const UseNonEmptyFallbackStory: React.FC<UseNonEmptyFallbackStoryProps> = (props) => {
  const { value } = props;

  const nonEmptyValue = useNonEmptyFallback(value);

  return String(nonEmptyValue);
};
