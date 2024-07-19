import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OverlayCardProps } from './OverlayCard';
import { useStyles } from './useStyles';
import { isNotNull, isNotUndefined } from '~/shared/utils/typescript';
import { useClickOutside } from '~/shared/hooks/useClickOutside/useClickOutside';
import { mergeRefs } from 'react-merge-refs';

export const useOverlayCard = (props: OverlayCardProps) => {
  const {
    align,
    closeOnOutsideClick = true,
    darkenBackground,
    isOpen: isOpenProp,
    matchTriggerWidth = false,
    onClose,
    onOpen,
    position,
    triggerRef,
    anchorRef = triggerRef,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const styles = useStyles({
    align,
    anchorRef,
    matchTriggerWidth,
    position,
  });

  const {
    animateOutBackground,
    animateInWrapper,
    animateOutWrapper,
    backgroundRef,
    registerContent,
    updateStyles,
    wrapperRef,
  } = styles;

  const close = useCallback(async () => {
    await Promise.all(
      [animateOutWrapper(), darkenBackground ? animateOutBackground() : null].filter(isNotNull),
    );
    setIsOpen(false);
    onClose?.();
    wrapperRef.current = null;
    backgroundRef.current = null;

    previouslyFocusedElementRef.current?.focus();
  }, [
    animateOutBackground,
    animateOutWrapper,
    backgroundRef,
    darkenBackground,
    onClose,
    wrapperRef,
  ]);

  const open = useCallback(async () => {
    setIsOpen(true);
    onOpen?.();

    setTimeout(() => {
      updateStyles();
    });

    if (document.activeElement instanceof HTMLElement) {
      previouslyFocusedElementRef.current = document.activeElement;
    }
  }, [onOpen, updateStyles]);

  useEffect(() => {
    if (isOpenProp === undefined) return;
    if (isOpenProp) {
      open();
    } else {
      close();
    }
  }, [close, isOpenProp, open]);

  useEffect(() => {
    const trigger = triggerRef?.current;
    if (!trigger) return;

    const handleClick = () => {
      if (isOpen) {
        close();
      } else {
        open();
      }
    };

    trigger.addEventListener('click', handleClick);

    return () => {
      trigger.removeEventListener('click', handleClick);
    };
  }, [animateInWrapper, close, isOpen, open, triggerRef, updateStyles]);

  const localRef = useRef<HTMLDivElement | null>(null);

  useClickOutside({
    active: isOpen,
    disabled: !closeOnOutsideClick,
    additionalRefs: useMemo(() => [localRef, triggerRef].filter(isNotUndefined), [triggerRef]),
    handler: useCallback(() => {
      close();
    }, [close]),
    ref: localRef,
  });

  const childrenProps = useMemo(() => ({ close }), [close]);

  const refs = useMemo(() => mergeRefs([localRef, registerContent]), [localRef, registerContent]);

  return useMemo(
    () => ({
      childrenProps,
      close,
      isOpen,
      refs,
      styles,
    }),
    [childrenProps, close, isOpen, refs, styles],
  );
};
