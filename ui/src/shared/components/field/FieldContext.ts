import React from 'react';

export type FieldContextProps = {
  controlId: string;
};

export const FieldContext = React.createContext<FieldContextProps | null>(null);
