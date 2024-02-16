import { useCallback, useMemo, useState } from 'react';
import type { DropMarker } from './types';

export const useDragAndDrop = () => {
  const [dropMarkers, setDropMarkers] = useState<DropMarker[]>([]);

  const [activeDropMarker, setActiveDropMarker] = useState<DropMarker | null>(null);

  const addDropMarker = useCallback((dropMarker: DropMarker) => {
    setDropMarkers((currentDropMarkers) => [...currentDropMarkers, dropMarker]);
  }, []);

  const removeDropMarker = useCallback((dropMarker: DropMarker) => {
    setDropMarkers((currentDropMarkers) =>
      currentDropMarkers.filter((currentDropMarker) => currentDropMarker !== dropMarker),
    );
  }, []);

  return useMemo(
    () => ({
      activeDropMarker,
      addDropMarker,
      dropMarkers,
      removeDropMarker,
      setActiveDropMarker,
    }),
    [activeDropMarker, addDropMarker, dropMarkers, removeDropMarker],
  );
};
