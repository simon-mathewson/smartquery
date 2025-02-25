import { useNonEmptyFallback } from './useNonEmptyFallback';

export type UseNonEmptyFallbackStoryProps = {
  value: unknown;
};

export const UseNonEmptyFallbackStory: React.FC<UseNonEmptyFallbackStoryProps> = (props) => {
  const { value } = props;

  const previousValue = useNonEmptyFallback(value);

  return String(previousValue);
};
