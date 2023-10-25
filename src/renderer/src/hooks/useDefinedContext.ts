import { useContext } from 'react';

export const useDefinedContext = <T>(context: React.Context<T | null>): T => {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`Context ${context.displayName} is not defined`);
  }
  return value;
};
