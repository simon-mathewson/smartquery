import { createContext } from 'react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useDragAndDrop } from './useDragAndDrop';

export const DragAndDropContext = createContext<ReturnType<typeof useDragAndDrop> | null>(null);

export const DragAndDropProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const context = useDragAndDrop();

  return <DragAndDropContext.Provider value={context}>{children}</DragAndDropContext.Provider>;
};
