import React from 'react';

export type FieldContextProps = {
  controlHtmlProps: {
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    id: string;
  };
};

export const FieldContext = React.createContext<FieldContextProps | null>(null);

FieldContext.displayName = 'FieldContext';
