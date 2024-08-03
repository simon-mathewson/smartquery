import React from 'react';
import { useDefinedContext } from './useDefinedContext';

export const UseDefinedContextTestContext = React.createContext<true | null>(null);
UseDefinedContextTestContext.displayName = 'UseDefinedContextTestContext';

export const UseDefinedContextStory: React.FC = () => {
  try {
    useDefinedContext(UseDefinedContextTestContext);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : null;
  }
};
