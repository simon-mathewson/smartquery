import { useClickOutside } from '~/hooks/useClickOutside';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Animate } from '../Animate/Animate';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../OverlayPortal/OverlayPortal';

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
  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<CSSProperties>();
  const [width, setWidth] = useState<string>();

  const updateStyles = () => {
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
  };

  useEffect(() => {
    updateStyles();

    window.addEventListener('resize', updateStyles);

    return () => {
      window.removeEventListener('resize', updateStyles);
    };
  }, []);

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
  }, []);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useClickOutside({
    handler: () => setIsOpen(false),
    refs: [cardRef, triggerRef],
  });

  useEffect(() => {
    if (isOpen) {
      onOpen?.();
    }
  }, [isOpen]);

  return (
    <OverlayPortal>
      <Animate show={isOpen}>
        {(ref) => (
          <div
            className={classNames('absolute z-10 rounded-lg bg-gray-50 shadow-xl', className)}
            ref={mergeRefs([ref, cardRef])}
            style={{ ...styles, width }}
          >
            {children(() => setIsOpen(false))}
          </div>
        )}
      </Animate>
    </OverlayPortal>
  );
};
