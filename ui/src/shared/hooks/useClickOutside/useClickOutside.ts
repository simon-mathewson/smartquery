import { useEffect } from 'react';
import type { HtmlRef } from '~/shared/types';
import { useDefinedContext } from '../useDefinedContext';
import { ClickOutsideQueueContext } from './useQueue/Context';

export const useClickOutside = (props: {
  active: boolean;
  additionalRefs?: HtmlRef[];
  disabled?: boolean;
  handler: () => void;
  ref: HtmlRef;
}) => {
  const { active, additionalRefs, disabled: disabledProp, handler, ref } = props;

  const {
    addRef: addRefToQueue,
    refs,
    removeRef: removeRefFromQueue,
  } = useDefinedContext(ClickOutsideQueueContext);

  useEffect(() => {
    if (active) {
      addRefToQueue(ref);
    } else {
      removeRefFromQueue(ref);
    }
    return () => removeRefFromQueue(ref);
  }, [active, addRefToQueue, ref, removeRefFromQueue]);

  const index = refs.indexOf(ref);
  const childRefs = refs.slice(index + 1);

  const disabled = childRefs.length > 0 || disabledProp;

  useEffect(() => {
    if (disabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const isClickInsideSomeRef = [ref, ...(additionalRefs ?? [])].some(
        (ref) => ref.current?.contains(event.target as HTMLElement),
      );

      if (isClickInsideSomeRef) return;

      handler();
    };

    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [additionalRefs, disabled, handler, ref]);
};
