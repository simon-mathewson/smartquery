import { useCallback, useMemo, useState } from 'react';
import { OverlayCardRef } from './types';

export const useOverlay = () => {
  const [overlayCardRefs, setOverlayCardRefs] = useState<OverlayCardRef[]>([]);

  const addOverlayCardRef = useCallback((overlayCardRef: OverlayCardRef) => {
    setOverlayCardRefs((currentOverlayCardRefs) => [...currentOverlayCardRefs, overlayCardRef]);
  }, []);

  const removeOverlayCardRef = useCallback((overlayCardRef: OverlayCardRef) => {
    setOverlayCardRefs((currentOverlayCardRefs) =>
      currentOverlayCardRefs.filter(
        (currentOverlayCardRef) => currentOverlayCardRef !== overlayCardRef,
      ),
    );
  }, []);

  return useMemo(
    () => ({
      addOverlayCardRef,
      overlayCardRefs,
      removeOverlayCardRef,
    }),
    [addOverlayCardRef, overlayCardRefs, removeOverlayCardRef],
  );
};
