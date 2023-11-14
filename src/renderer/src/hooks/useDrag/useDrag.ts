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

  const cursorOffsetRef = useRef({ x: 0, y: 0 });

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

    document.querySelector('#overlay')!.appendChild(clone);

    cloneRef.current = clone;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (event.offsetX < 10 || event.offsetY < 10) return;

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

      const cursorOffset = cursorOffsetRef.current;

      clone.style.top = `${Number(event.clientY - cursorOffset.y)}px`;
      clone.style.left = `${Number(event.clientX - cursorOffset.x)}px`;
    },
    [createClone, dropMarkers],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      triggerRef.current = event.currentTarget as HTMLElement | null;

      const triggerRect = triggerRef.current!.getBoundingClientRect();

      cursorOffsetRef.current = {
        x: event.clientX - triggerRect.x,
        y: event.clientY - triggerRect.y,
      };

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

          if (event.offsetX < 10 || event.offsetY < 10) return;

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
