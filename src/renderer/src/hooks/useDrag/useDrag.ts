import { Query } from '@renderer/types';
import { useCallback, useRef, useState } from 'react';
import { getClosestDropMarker } from './utils';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '../useDefinedContext';

export const useDrag = (props: {
  dragRef?: React.MutableRefObject<HTMLElement | null>;
  query: Query;
}) => {
  const { dragRef, query } = props;

  const { dropMarkers, setDropMarkers, setQueries } = useDefinedContext(GlobalContext);

  const [isDragging, setIsDragging] = useState(false);

  const triggerRef = useRef<HTMLElement | null>(null);

  const cloneRef = useRef<HTMLElement | null>(null);

  const startRef = useRef({ x: 0, y: 0 });

  const isUnlocked = useRef(false);

  const createClone = useCallback((element?: HTMLElement) => {
    const dragEl = element ?? dragRef?.current;
    if (!dragEl) return;

    const rect = dragEl.getBoundingClientRect();
    const clone = dragEl.cloneNode(true) as HTMLElement;

    clone.style.position = 'absolute';
    clone.style.top = `${rect.top}px`;
    clone.style.left = `${rect.left}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.cursor = 'grabbing';
    clone.style.zIndex = '100';

    document.querySelector('#overlay')!.appendChild(clone);

    cloneRef.current = clone;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const start = startRef.current;

      const offsetX = Math.abs(start.x - event.clientX);
      const offsetY = Math.abs(start.y - event.clientY);
      if (offsetX < 5 && offsetY < 5 && !isUnlocked.current) return;

      isUnlocked.current = true;

      setIsDragging(true);

      const closestDropMarker = getClosestDropMarker(dropMarkers, event.clientX, event.clientY)!;
      setDropMarkers((markers) => {
        return markers.map((marker) => {
          if (
            marker.column === closestDropMarker.column &&
            marker.row === closestDropMarker.row &&
            marker.horizontal === closestDropMarker.horizontal
          ) {
            return { ...marker, active: true };
          }
          return { ...marker, active: false };
        });
      });

      if (!cloneRef.current) {
        createClone(triggerRef.current ?? undefined);
      }

      const clone = cloneRef.current!;

      const trigger = triggerRef.current!;
      const triggerRect = trigger.getBoundingClientRect();

      clone.style.top = `${Number(event.clientY - (start.y - triggerRect.y))}px`;
      clone.style.left = `${Number(event.clientX - (start.x - triggerRect.x))}px`;
    },
    [createClone, dropMarkers],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      triggerRef.current = event.currentTarget as HTMLElement | null;

      startRef.current = { x: event.clientX, y: event.clientY };

      document.addEventListener('mousemove', handleMouseMove, { passive: true });

      document.addEventListener(
        'mouseup',
        (event) => {
          document.removeEventListener('mousemove', handleMouseMove);

          if (cloneRef.current) {
            document.querySelector('#overlay')?.removeChild(cloneRef.current);
          }

          setDropMarkers((markers) => markers.map((marker) => ({ ...marker, active: false })));
          cloneRef.current = null;
          triggerRef.current = null;
          setIsDragging(false);
          isUnlocked.current = false;

          const start = startRef.current;

          const offsetX = Math.abs(start.x - event.clientX);
          const offsetY = Math.abs(start.y - event.clientY);
          if (offsetX < 5 && offsetY < 5 && !isUnlocked.current) return;

          const targetMarker = getClosestDropMarker(dropMarkers, event.clientX, event.clientY)!;
          const { column, horizontal, row } = targetMarker;

          setQueries((queries) => {
            const newQueries = queries.map((column) => [...column]);

            if (!newQueries[column]) {
              newQueries[column] = [query];
            } else {
              if (horizontal) {
                newQueries[column].splice(row, 0, query);
              } else {
                newQueries.splice(column, 0, [query]);
              }
            }

            return newQueries;
          });
        },
        { once: true },
      );
    },
    [handleMouseMove],
  );

  return { handleMouseDown, isDragging };
};
