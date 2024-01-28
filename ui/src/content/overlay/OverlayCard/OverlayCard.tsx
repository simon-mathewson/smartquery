import { useClickOutside } from '~/shared/hooks/useClickOutside';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../../../shared/components/OverlayPortal/OverlayPortal';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { useAnimate } from './useAnimate';
import { OverlayContext } from '../Context';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (close: () => void) => React.ReactNode;
  className?: string;
  matchTriggerWidth?: boolean;
  onOpen?: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  width?: number;
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  align = 'left',
  children,
  className,
  matchTriggerWidth,
  onOpen,
  triggerRef,
  anchorRef = triggerRef,
}) => {
  const { addOverlayCardRef, overlayCardRefs, removeOverlayCardRef } =
    useDefinedContext(OverlayContext);

  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<CSSProperties>();
  const [width, setWidth] = useState<string>();

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

    const top = anchorRect.top + anchorRect.height + 8;

    setStyles({
      left: `${left}px`,
      top: `${top}px`,
      transform,
    });

    if (matchTriggerWidth) {
      setWidth(`${anchorRect.width}px`);
    }
  }, [align, anchorRef, matchTriggerWidth]);

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

  const cardRef = useRef<HTMLDivElement | null>(null);

  const { contentRef, isVisible } = useAnimate({ show: isOpen });

  useEffect(() => {
    if (isOpen) {
      addOverlayCardRef(cardRef);
    } else {
      removeOverlayCardRef(cardRef);
    }

    return () => removeOverlayCardRef(cardRef);
  }, [addOverlayCardRef, isOpen, removeOverlayCardRef]);

  const cardIndex = overlayCardRefs.indexOf(cardRef);
  const childCards = overlayCardRefs.slice(cardIndex + 1);

  useClickOutside({
    disabled: childCards.length > 0,
    handler: () => setIsOpen(false),
    refs: [cardRef, triggerRef, ...childCards],
  });

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <OverlayPortal>
      {isVisible && (
        <div
          className={classNames(
            'absolute z-10 rounded-lg border border-gray-200 bg-gray-50 shadow-xl',
            className,
          )}
          ref={mergeRefs([contentRef, cardRef])}
          style={{ ...styles, width }}
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </OverlayPortal>
  );
};
