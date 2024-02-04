import { useClickOutside } from '~/shared/hooks/useClickOutside/useClickOutside';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../OverlayPortal/OverlayPortal';
import { useAnimate } from './useAnimate';
import { overlayCardMargin } from './constants';
import { useDebouncedCallback } from 'use-debounce';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (props: { close: () => void }) => React.ReactNode;
  className?: string;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  width?: number;
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  align = 'left',
  children,
  className,
  matchTriggerWidth,
  onClose,
  onOpen,
  triggerRef,
  anchorRef = triggerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<CSSProperties>();

  const [contentDimensions, setContentDimensions] = useState<{
    height: number;
    width: number;
  } | null>(null);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const handleResize = useDebouncedCallback((newDimensions: { height: number; width: number }) => {
    setContentDimensions(newDimensions);
  }, 10);

  const registerContent = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver((entries) => {
        const { scrollHeight, scrollWidth } = entries[0].target;
        handleResize({
          height: scrollHeight,
          width: scrollWidth,
        });
      });

      resizeObserverRef.current.observe(element);
    },
    [handleResize],
  );

  const updateStyles = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const anchorRect = anchor.getBoundingClientRect();

    const left = {
      left: anchorRect.left,
      center: anchorRect.left + anchorRect.width / 2,
      right: anchorRect.left + anchorRect.width,
    }[align];

    const transform = {
      left: undefined,
      center: 'translateX(-50%)',
      right: 'translateX(-100%)',
    }[align];

    const spaceBelow = window.innerHeight - anchorRect.bottom - overlayCardMargin * 2;
    const spaceAbove = anchorRect.top - overlayCardMargin * 2;
    const showAbove = (() => {
      if (!contentDimensions || contentDimensions.height <= spaceBelow) return false;

      return contentDimensions.height <= spaceAbove || spaceAbove > spaceBelow;
    })();

    const top = showAbove ? undefined : anchorRect.top + anchorRect.height + overlayCardMargin;
    const bottom = showAbove ? window.innerHeight - anchorRect.top + overlayCardMargin : undefined;

    setStyles({
      bottom: bottom ? `${bottom}px` : undefined,
      left: `${left}px`,
      maxHeight: showAbove ? `${spaceAbove}px` : `${spaceBelow}px`,
      top: top ? `${top}px` : undefined,
      transform,
      width: matchTriggerWidth ? `${anchorRect.width}px` : undefined,
    });
  }, [align, anchorRef, contentDimensions, matchTriggerWidth]);

  useEffect(() => {
    updateStyles();

    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, [updateStyles]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const handleClick = () => {
      updateStyles();
      setIsOpen((_isOpen) => !_isOpen);
    };

    trigger.addEventListener('click', handleClick);

    return () => {
      trigger.removeEventListener('click', handleClick);
    };
  }, [triggerRef, updateStyles]);

  const localRef = useRef<HTMLDivElement | null>(null);

  const { contentRef: animateCardRef, isVisible } = useAnimate({ show: isOpen });

  useClickOutside({
    active: isOpen,
    handler: useCallback(() => setIsOpen(false), []),
    ref: localRef,
    additionalRefs: useMemo(() => [localRef, triggerRef], [triggerRef]),
  });

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    } else {
      onClose?.();
    }

    return () => onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <OverlayPortal>
      {isVisible && (
        <div
          className={classNames(
            'absolute z-10 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl',
            className,
          )}
          ref={mergeRefs([animateCardRef, localRef, registerContent])}
          style={styles}
        >
          {children({ close: () => setIsOpen(false) })}
        </div>
      )}
    </OverlayPortal>
  );
};
