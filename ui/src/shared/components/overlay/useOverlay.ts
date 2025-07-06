import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStyles } from './useStyles';
import { isNotNull, isNotUndefined } from '~/shared/utils/typescript/typescript';
import { useEscape } from '~/shared/hooks/useEscape/useEscape';
import { mergeRefs } from 'react-merge-refs';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { focusFirstControl } from '~/shared/utils/focusFirstControl/focusFirstControl';
import type { StyleOptions } from './styleOptions';

export type UseOverlayProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  closeOnOutsideClick?: boolean;
  darkenBackground?: boolean;
  isOpen?: boolean;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  position?: {
    x: 'left' | 'center' | 'right';
    y: 'top' | 'center' | 'bottom';
  };
  styleOptions?: Partial<StyleOptions>;
  triggerRef?: React.MutableRefObject<HTMLElement | null>;
};

export type OverlayControl = ReturnType<typeof useOverlay>;

export const useOverlay = (props: UseOverlayProps) => {
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
    styleOptions,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const styles = useStyles({
    align,
    anchorRef,
    matchTriggerWidth,
    position,
    styleOptions,
  });

  const {
    animateOutBackground,
    animateOutWrapper,
    backgroundRef,
    registerContent,
    updateStyles,
    wrapperRef,
  } = styles;

  const close = useCallback(async () => {
    previouslyFocusedElementRef.current?.focus();

    await Promise.all(
      [animateOutWrapper(), darkenBackground ? animateOutBackground() : null].filter(isNotNull),
    );
    setIsOpen(false);
    onClose?.();
    wrapperRef.current = null;
    backgroundRef.current = null;
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

      if (localRef.current) {
        focusFirstControl(localRef.current);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenProp]);

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
  }, [close, isOpen, open, triggerRef]);

  const localRef = useRef<HTMLDivElement | null>(null);

  const clickOutsideProps = useMemo(
    () => ({
      additionalRefs: [triggerRef].filter(isNotUndefined),
      ref: localRef,
    }),
    [localRef, triggerRef],
  );

  const { isTopLevel } = useEscape({
    active: isOpen,
    clickOutside: closeOnOutsideClick ? clickOutsideProps : undefined,
    handler: close,
  });

  const childrenProps = useMemo(() => ({ close, open }), [close, open]);

  const ref = useMemo(() => mergeRefs([localRef, registerContent]), [localRef, registerContent]);

  useKeyboardNavigation({ isTopLevel, ref: localRef });

  return useMemo(
    () => ({
      childrenProps,
      close,
      darkenBackground,
      isOpen,
      open,
      ref,
      styles,
    }),
    [childrenProps, close, darkenBackground, isOpen, open, ref, styles],
  );
};
