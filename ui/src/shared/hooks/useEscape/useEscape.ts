import { useEffect, useState } from 'react';
import type { HtmlRef } from '~/shared/types';
import { useDefinedContext } from '../useDefinedContext/useDefinedContext';
import { EscapeStackContext } from './useStack/Context';
import { v4 as uuid } from 'uuid';

export type UseEscapeProps = {
  active: boolean;
  clickOutside?: {
    additionalRefs?: HtmlRef[];
    ref: HtmlRef;
  };
  handler: () => void;
};

/** Manages escaping (e.g. closing a modal) via escape key or clicking outside */
export const useEscape = (props: UseEscapeProps) => {
  const { active, clickOutside, handler } = props;

  const {
    add: addToEscapeStack,
    remove: removeFromEscapeStack,
    stack: escapeStack,
  } = useDefinedContext(EscapeStackContext);

  const [id] = useState(uuid);

  useEffect(() => {
    if (active) {
      addToEscapeStack(id);
    } else {
      removeFromEscapeStack(id);
    }
    return () => removeFromEscapeStack(id);
  }, [active, addToEscapeStack, id, removeFromEscapeStack]);

  const index = escapeStack.indexOf(id);
  const childRefs = escapeStack.slice(index + 1);

  const isTopLevel = childRefs.length === 0;

  useEffect(() => {
    if (!isTopLevel || !clickOutside || !active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const isClickInsideSomeRef = [clickOutside.ref, ...(clickOutside.additionalRefs ?? [])].some(
        (ref) => ref.current?.contains(event.target as HTMLElement),
      );

      if (isClickInsideSomeRef) return;

      handler();
    };

    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [isTopLevel, clickOutside, handler, active]);

  useEffect(() => {
    if (!isTopLevel) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [isTopLevel, handler]);

  return { isTopLevel };
};
