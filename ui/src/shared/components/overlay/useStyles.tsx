import { merge } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { animate } from './animate';
import { defaultStyleOptions } from './styleOptions';
import type { UseOverlayProps } from './useOverlay';

export type UseStylesProps = Pick<
  UseOverlayProps,
  'align' | 'anchorRef' | 'matchTriggerWidth' | 'position' | 'styleOptions'
>;

export const useStyles = (props: UseStylesProps) => {
  const {
    align = 'left',
    anchorRef,
    matchTriggerWidth,
    position,
    styleOptions: styleOptionsProp,
  } = props;

  const styleOptions = useMemo(
    () => merge(defaultStyleOptions, styleOptionsProp),
    [styleOptionsProp],
  );
  const { overlayMargin, animationVerticalOffset, animationOptions } = styleOptions;

  const animateFromBottomRef = useRef(position?.y === 'bottom');

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleResize = useDebouncedCallback(() => {
    updateStyles();
  }, 10);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  const updateStylesBasedOnAnchor = useCallback(
    (anchor: HTMLElement) => {
      const overlay = wrapperRef.current;
      if (!overlay) return;

      const anchorRect = anchor.getBoundingClientRect();

      const overlayWidth = overlay.offsetWidth;

      const unboundedLeft = {
        left: anchorRect.left,
        center: anchorRect.left + anchorRect.width / 2 - overlayWidth / 2,
        right: anchorRect.right - overlayWidth,
      }[align];

      const left = Math.max(
        overlayMargin,
        Math.min(window.innerWidth - overlayWidth - overlayMargin, unboundedLeft),
      );

      const spaceBelow = window.innerHeight - anchorRect.bottom - overlayMargin * 2;
      const spaceAbove = anchorRect.top - overlayMargin * 2;
      const scrollHeight = overlay.scrollHeight;

      const newShowAbove = (() => {
        if (!scrollHeight || scrollHeight <= spaceBelow) return false;
        return scrollHeight <= spaceAbove || spaceAbove > spaceBelow;
      })();

      animateFromBottomRef.current = newShowAbove;

      const top = newShowAbove ? undefined : anchorRect.top + anchorRect.height + overlayMargin;
      const bottom = newShowAbove ? window.innerHeight - anchorRect.top + overlayMargin : undefined;

      Object.assign(overlay.style, {
        bottom: bottom ? `${bottom}px` : '',
        left: `${left}px`,
        maxHeight: newShowAbove ? `${spaceAbove}px` : `${spaceBelow}px`,
        top: top ? `${top}px` : '',
        width: matchTriggerWidth ? `${anchorRect.width}px` : '',
      });
    },
    [align, matchTriggerWidth, overlayMargin],
  );

  const updateStylesBasedOnPosition = useCallback(() => {
    const overlay = wrapperRef.current;
    if (!overlay) return;

    const overlayWidth = overlay.offsetWidth;
    const overlayHeight = overlay.offsetHeight;

    const positionX = position?.x ?? 'center';
    const positionY = position?.y ?? 'center';

    const left = {
      left: overlayMargin,
      center: window.innerWidth / 2 - overlayWidth / 2,
      right: window.innerWidth - overlayWidth - overlayMargin,
    }[positionX];

    const top = {
      top: overlayMargin,
      center: window.innerHeight / 2 - overlayHeight / 2,
      bottom: window.innerHeight - overlayHeight - overlayMargin,
    }[positionY];

    Object.assign(overlay.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: '',
    });
  }, [overlayMargin, position?.x, position?.y]);

  const updateStyles = useCallback(() => {
    const anchor = anchorRef?.current;

    if (anchor) {
      updateStylesBasedOnAnchor(anchor);
    } else {
      updateStylesBasedOnPosition();
    }
  }, [anchorRef, updateStylesBasedOnAnchor, updateStylesBasedOnPosition]);

  const animateInBackground = useCallback(
    (background: HTMLElement) =>
      animate(
        background,
        { backgroundColor: 'rgba(0, 0, 0, 0)' },
        { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        animationOptions,
      ),
    [animationOptions],
  );

  const animateOutBackground = useCallback(async () => {
    const background = backgroundRef.current;
    if (!background) return;

    await animate(
      background,
      { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      { backgroundColor: 'rgba(0, 0, 0, 0)' },
      animationOptions,
    );
  }, [animationOptions]);

  const getInStyles = useCallback(
    () =>
      ({
        opacity: '1',
        transform: 'translateY(0)',
      }) as const,
    [],
  );

  const getOutStyles = useCallback(
    (animateFromBottom: boolean) =>
      ({
        opacity: '0',
        transform: animateFromBottom
          ? `translateY(${animationVerticalOffset}px)`
          : `translateY(-${animationVerticalOffset}px)`,
      }) as const,
    [animationVerticalOffset],
  );

  const animateInWrapper = useCallback(
    (wrapper: HTMLElement) =>
      animate(wrapper, getOutStyles(animateFromBottomRef.current), getInStyles(), animationOptions),
    [animationOptions, getInStyles, getOutStyles],
  );

  const animateOutWrapper = useCallback(async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    await animate(
      wrapper,
      getInStyles(),
      getOutStyles(animateFromBottomRef.current),
      animationOptions,
    );
  }, [animationOptions, getInStyles, getOutStyles]);

  useEffect(() => {
    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, [updateStyles]);

  const registerContent = useCallback(
    (element: HTMLDivElement | null) => {
      overlayRef.current = element;

      if (!element) return;

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserverRef.current.observe(element);
    },
    [handleResize],
  );

  return useMemo(
    () => ({
      animateInBackground,
      animateInWrapper,
      animateOutBackground,
      animateOutWrapper,
      backgroundRef,
      registerContent,
      updateStyles,
      wrapperRef,
    }),
    [
      animateInBackground,
      animateInWrapper,
      animateOutBackground,
      animateOutWrapper,
      registerContent,
      updateStyles,
    ],
  );
};
