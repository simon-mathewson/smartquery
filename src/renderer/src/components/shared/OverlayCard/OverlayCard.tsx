import { useClickOutside } from '@renderer/hooks/useClickOutside';
import React, { useEffect, useRef, useState } from 'react';
import { Animate } from '../Animate/Animate';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';

export type OverlayCardProps = {
  children: (close: () => void) => React.ReactNode;
  className?: string;
  matchTriggerWidth?: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  children,
  className,
  matchTriggerWidth,
  triggerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [width, setWidth] = useState('auto');

  useEffect(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    setPosition({
      left: trigger.offsetLeft,
      top: trigger.offsetTop + trigger.offsetHeight + 8,
    });
    setWidth(matchTriggerWidth ? `${trigger.offsetWidth}px` : 'auto');

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
            'absolute rounded-lg bg-white/80 shadow-xl backdrop-blur-lg',
            className,
          )}
          ref={mergeRefs([ref, cardRef])}
          style={{ ...position, width }}
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </Animate>
  );
};
