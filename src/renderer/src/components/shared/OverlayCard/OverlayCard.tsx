import { useClickOutside } from '@renderer/hooks/useClickOutside';
import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { Animate } from '../Animate/Animate';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  children: (close: () => void) => React.ReactNode;
  className?: string;
  matchTriggerWidth?: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  width?: number;
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  align = 'left',
  children,
  className,
  matchTriggerWidth,
  triggerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [styles, setStyles] = useState<CSSProperties>();
  const [width, setWidth] = useState<string>();

  const updateStyles = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const left = {
      left: trigger.offsetLeft,
      center: trigger.offsetLeft + trigger.offsetWidth / 2,
      right: trigger.offsetLeft + trigger.offsetWidth,
    }[align];

    const transform = {
      left: undefined,
      center: 'translateX(-50%)',
      right: 'translateX(-100%)',
    }[align];

    const top = trigger.offsetTop + trigger.offsetHeight + 8;

    setStyles({
      left: `${left}px`,
      top: `${top}px`,
      transform,
    });

    if (matchTriggerWidth) {
      setWidth(`${trigger.offsetWidth}px`);
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

  return (
    <Animate show={isOpen}>
      {(ref) => (
        <div
          className={classNames(
            'absolute z-10 rounded-lg bg-white/80 shadow-xl backdrop-blur-lg',
            className,
          )}
          ref={mergeRefs([ref, cardRef])}
          style={{ ...styles, width }}
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </Animate>
  );
};
