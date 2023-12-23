import { useClickOutside } from '~/hooks/useClickOutside';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../OverlayPortal/OverlayPortal';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { GlobalContext } from '~/contexts/GlobalContext';
import { useAnimate } from './useAnimate';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
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
}) => {
  const { overlayCardRefs, setOverlayCardRefs } = useDefinedContext(GlobalContext);

  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<CSSProperties>();
  const [width, setWidth] = useState<string>();

  const updateStyles = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();

    const left = {
      left: triggerRect.left,
      center: triggerRect.left + triggerRect.width / 2,
      right: triggerRect.left + triggerRect.width,
    }[align];

    const transform = {
      left: undefined,
      center: 'translateX(-50%)',
      right: 'translateX(-100%)',
    }[align];

    const top = triggerRect.top + triggerRect.height + 8;

    setStyles({
      left: `${left}px`,
      top: `${top}px`,
      transform,
    });

    if (matchTriggerWidth) {
      setWidth(`${triggerRect.width}px`);
    }
  }, [align, matchTriggerWidth, triggerRef]);

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
      setIsOpen((_isOpen) => !_isOpen);
    };

    trigger.addEventListener('click', handleClick);

    return () => {
      trigger.removeEventListener('click', handleClick);
    };
  }, [triggerRef]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const { contentRef, isVisible } = useAnimate({ show: isOpen });

  useEffect(() => {
    const removeRef = () => setOverlayCardRefs((refs) => refs.filter((ref) => ref !== cardRef));

    if (isVisible) {
      setOverlayCardRefs((refs) => (refs.includes(cardRef) ? refs : [...refs, cardRef]));
    } else {
      removeRef();
    }

    return removeRef;
  }, [isVisible, setOverlayCardRefs]);

  const cardIndex = overlayCardRefs.indexOf(cardRef);
  const childCards = overlayCardRefs.slice(cardIndex + 1);

  useClickOutside({
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
