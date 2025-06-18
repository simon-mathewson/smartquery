import { createContext } from 'react';
import type { useDragAndDrop } from './useDragAndDrop';

export const DragAndDropContext = createContext<ReturnType<typeof useDragAndDrop> | null>(null);

DragAndDropContext.displayName = 'DragAndDropContext';
