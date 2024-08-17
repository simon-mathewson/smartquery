import { usePrevious } from './usePrevious';

export type UsePreviousStoryProps = {
  value: unknown;
};

export const UsePreviousStory: React.FC<UsePreviousStoryProps> = (props) => {
  const { value } = props;

  const previousValue = usePrevious(value);

  return String(previousValue);
};
