import { createContext } from 'react';
import type { useDragAndDrop } from './useDragAndDrop';

export type DragAndDropContextType = ReturnType<typeof useDragAndDrop>;

export const DragAndDropContext = createContext<DragAndDropContextType | null>(null);

DragAndDropContext.displayName = 'DragAndDropContext';
