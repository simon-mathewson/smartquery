import { useClickOutside } from '~/shared/hooks/useClickOutside/useClickOutside';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../OverlayPortal/OverlayPortal';
import { useStyles } from './useStyles';

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
  matchTriggerWidth = false,
  onClose,
  onOpen,
  triggerRef,
  anchorRef = triggerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { animateIn, animateOut, registerContent, updateStyles, wrapperRef } = useStyles({
    align,
    anchorRef,
    matchTriggerWidth,
  });

  const close = useCallback(async () => {
    await animateOut();
    setIsOpen(false);
    onClose?.();
  }, [animateOut, onClose]);

  const open = useCallback(async () => {
    setIsOpen(true);
    onOpen?.();
    setTimeout(() => {
      updateStyles();
      animateIn();
    });
  }, [animateIn, onOpen, updateStyles]);

  useEffect(() => {
    const trigger = triggerRef.current;
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
  }, [animateIn, close, isOpen, open, triggerRef, updateStyles]);

  const localRef = useRef<HTMLDivElement | null>(null);

  useClickOutside({
    active: isOpen,
    additionalRefs: useMemo(() => [localRef, triggerRef], [triggerRef]),
    handler: useCallback(() => {
      close();
    }, [close]),
    ref: localRef,
  });

  const childrenProps = useMemo(() => ({ close }), [close]);

  const refs = useMemo(() => mergeRefs([localRef, registerContent]), [localRef, registerContent]);

  return (
    <OverlayPortal>
      {isOpen && (
        <div className={classNames('fixed z-30 opacity-0')} ref={wrapperRef}>
          <div
            className={classNames(
              'overflow-auto rounded-xl border border-border bg-card shadow-xl [max-height:inherit]',
              className,
            )}
            ref={refs}
          >
            {children(childrenProps)}
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
