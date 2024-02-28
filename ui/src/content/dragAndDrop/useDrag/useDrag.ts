import { useCallback, useRef, useState } from 'react';
import { getClosestDropMarker } from './utils';
import { useDefinedContext } from '../../../shared/hooks/useDefinedContext';
import type { AddQueryOptions } from '~/content/tabs/types';
import { DragAndDropContext } from '../Context';
import { TabsContext } from '~/content/tabs/Context';

export const useDrag = (props: {
  dragRef?: React.MutableRefObject<HTMLElement | null>;
  query: AddQueryOptions;
}) => {
  const { dragRef, query } = props;

  const { activeTab, addQuery } = useDefinedContext(TabsContext);
  const { dropMarkers, setActiveDropMarker } = useDefinedContext(DragAndDropContext);

  const [isDragging, setIsDragging] = useState(false);

  const triggerRef = useRef<HTMLElement | null>(null);

  const cloneRef = useRef<HTMLElement | null>(null);

  const startRef = useRef({ x: 0, y: 0 });

  const isUnlocked = useRef(false);

  const createClone = useCallback(
    (element?: HTMLElement) => {
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
    },
    [dragRef],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const start = startRef.current;

      const offsetX = Math.abs(start.x - event.clientX);
      const offsetY = Math.abs(start.y - event.clientY);
      if (offsetX < 5 && offsetY < 5 && !isUnlocked.current) return;

      isUnlocked.current = true;

      setIsDragging(true);

      const closestDropMarker = getClosestDropMarker(dropMarkers, event.clientX, event.clientY)!;
      setActiveDropMarker(closestDropMarker);

      if (!cloneRef.current) {
        createClone(triggerRef.current ?? undefined);
      }

      const clone = cloneRef.current!;

      const trigger = triggerRef.current!;
      const triggerRect = trigger.getBoundingClientRect();

      clone.style.top = `${Number(event.clientY - (start.y - triggerRect.y))}px`;
      clone.style.left = `${Number(event.clientX - (start.x - triggerRect.x))}px`;
    },
    [createClone, dropMarkers, setActiveDropMarker],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (!activeTab) return;

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

          setActiveDropMarker(null);
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

          addQuery(query, { column, row: horizontal ? row : undefined });
        },
        { once: true },
      );
    },
    [activeTab, addQuery, dropMarkers, handleMouseMove, query, setActiveDropMarker],
  );

  return { handleMouseDown, isDragging };
};
