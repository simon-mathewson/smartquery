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
  anchorRef?: React.RefObject<HTMLElement>;
  closeOnOutsideClick?: boolean;
  darkenBackground?: boolean;
  disableFocusOnOpen?: boolean;
  isOpen?: boolean;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  position?: {
    x: 'left' | 'center' | 'right';
    y: 'top' | 'center' | 'bottom';
  };
  styleOptions?: Partial<StyleOptions>;
};

export type OverlayControl = ReturnType<typeof useOverlay>;

export const useOverlay = (props?: UseOverlayProps) => {
  const {
    align,
    anchorRef: anchorRefProp,
    closeOnOutsideClick = true,
    darkenBackground,
    disableFocusOnOpen,
    isOpen: isOpenProp,
    matchTriggerWidth = false,
    onClose,
    onOpen,
    position,
    styleOptions,
  } = props ?? {};

  const [isOpen, setIsOpen] = useState(false);

  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const styles = useStyles({
    align,
    anchorRef: anchorRefProp,
    matchTriggerWidth,
    position,
    styleOptions,
  });

  const {
    anchorRef,
    animateOutBackground,
    animateOutWrapper,
    backgroundRef,
    registerContent,
    triggerRef,
    wrapperRef,
  } = styles;

  const close = useCallback(async () => {
    if (!disableFocusOnOpen) {
      previouslyFocusedElementRef.current?.focus();
    }

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
    disableFocusOnOpen,
    darkenBackground,
    onClose,
    wrapperRef,
  ]);

  const open = useCallback(async () => {
    setIsOpen(true);
    onOpen?.();

    setTimeout(() => {
      if (!disableFocusOnOpen) {
        if (document.activeElement instanceof HTMLElement) {
          previouslyFocusedElementRef.current = document.activeElement;
        }

        if (localRef.current) {
          focusFirstControl(localRef.current);
        }
      }
    });
  }, [disableFocusOnOpen, onOpen]);

  useEffect(() => {
    if (isOpenProp === undefined) return;
    if (isOpenProp) {
      void open();
    } else {
      void close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenProp]);

  const onTriggerClick = useCallback(() => {
    if (isOpen) {
      void close();
    } else {
      void open();
    }
  }, [close, isOpen, open]);

  const triggerProps = useMemo(
    () => ({
      onClick: onTriggerClick,
      ref: triggerRef,
    }),
    [onTriggerClick, triggerRef],
  );

  const anchorProps = useMemo(
    () => ({
      ref: anchorRef,
    }),
    [anchorRef],
  );

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
      anchorProps,
      childrenProps,
      close,
      darkenBackground,
      isOpen,
      open,
      ref,
      styles,
      triggerProps,
    }),
    [anchorProps, childrenProps, close, darkenBackground, isOpen, open, ref, styles, triggerProps],
  );
};
