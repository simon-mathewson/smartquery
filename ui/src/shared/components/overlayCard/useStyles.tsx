import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { OverlayCardProps } from './OverlayCard';
import { animationVerticalOffset, overlayCardMargin } from './constants';
import { animate } from './animate';

export type UseStylesProps = Pick<
  OverlayCardProps,
  'align' | 'anchorRef' | 'matchTriggerWidth' | 'position'
>;

const getInStyles = () =>
  ({
    opacity: '1',
    transform: 'translateY(0)',
  }) as const;

const getOutStyles = (animateFromBottom: boolean) =>
  ({
    opacity: '0',
    transform: animateFromBottom
      ? `translateY(${animationVerticalOffset}px)`
      : `translateY(-${animationVerticalOffset}px)`,
  }) as const;

export const useStyles = (props: UseStylesProps) => {
  const { align = 'left', anchorRef, matchTriggerWidth, position } = props;

  const animateFromBottomRef = useRef(position?.y === 'bottom');

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleResize = useDebouncedCallback(() => {
    updateStyles();
  }, 10);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);

  const updateStylesBasedOnAnchor = useCallback(
    (anchor: HTMLElement) => {
      const card = wrapperRef.current;
      if (!card) return;

      const anchorRect = anchor.getBoundingClientRect();

      const cardWidth = card.offsetWidth;

      const unboundedLeft = {
        left: anchorRect.left,
        center: anchorRect.left + anchorRect.width / 2 - cardWidth / 2,
        right: anchorRect.right - cardWidth,
      }[align];

      const left = Math.max(
        overlayCardMargin,
        Math.min(window.innerWidth - cardWidth - overlayCardMargin, unboundedLeft),
      );

      const spaceBelow = window.innerHeight - anchorRect.bottom - overlayCardMargin * 2;
      const spaceAbove = anchorRect.top - overlayCardMargin * 2;
      const scrollHeight = card.scrollHeight;

      const newShowAbove = (() => {
        if (!scrollHeight || scrollHeight <= spaceBelow) return false;
        return scrollHeight <= spaceAbove || spaceAbove > spaceBelow;
      })();

      animateFromBottomRef.current = newShowAbove;

      const top = newShowAbove ? undefined : anchorRect.top + anchorRect.height + overlayCardMargin;
      const bottom = newShowAbove
        ? window.innerHeight - anchorRect.top + overlayCardMargin
        : undefined;

      Object.assign(card.style, {
        bottom: bottom ? `${bottom}px` : '',
        left: `${left}px`,
        maxHeight: newShowAbove ? `${spaceAbove}px` : `${spaceBelow}px`,
        top: top ? `${top}px` : '',
        width: matchTriggerWidth ? `${anchorRect.width}px` : '',
      });
    },
    [align, matchTriggerWidth],
  );

  const updateStylesBasedOnPosition = useCallback(() => {
    const card = wrapperRef.current;
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;

    const positionX = position?.x ?? 'center';
    const positionY = position?.y ?? 'center';

    const left = {
      left: overlayCardMargin,
      center: window.innerWidth / 2 - cardWidth / 2,
      right: window.innerWidth - cardWidth - overlayCardMargin,
    }[positionX];

    const top = {
      top: overlayCardMargin,
      center: window.innerHeight / 2 - cardHeight / 2,
      bottom: window.innerHeight - cardHeight - overlayCardMargin,
    }[positionY];

    Object.assign(card.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: '',
    });
  }, [position]);

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
      ),
    [],
  );

  const animateOutBackground = useCallback(async () => {
    const background = backgroundRef.current;
    if (!background) return;

    await animate(
      background,
      { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
      { backgroundColor: 'rgba(0, 0, 0, 0)' },
    );
  }, []);

  const animateInWrapper = useCallback(
    (wrapper: HTMLElement) =>
      animate(wrapper, getOutStyles(animateFromBottomRef.current), getInStyles()),
    [],
  );

  const animateOutWrapper = useCallback(async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    await animate(wrapper, getInStyles(), getOutStyles(animateFromBottomRef.current));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, [updateStyles]);

  const registerContent = useCallback(
    (element: HTMLDivElement | null) => {
      cardRef.current = element;

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
