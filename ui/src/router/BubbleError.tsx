import { useRouteError } from 'react-router-dom';

export const BubbleError: React.FC = () => {
  const error = useRouteError();
  throw error;
};
