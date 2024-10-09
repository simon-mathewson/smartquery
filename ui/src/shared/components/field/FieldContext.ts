import React from 'react';

export type FieldContextProps = {
  controlHtmlProps: {
    'aria-labelledby'?: string;
    id: string;
  };
};

export const FieldContext = React.createContext<FieldContextProps | null>(null);
