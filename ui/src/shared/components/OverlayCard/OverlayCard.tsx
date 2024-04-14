import { useClickOutside } from '~/shared/hooks/useClickOutside/useClickOutside';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../OverlayPortal/OverlayPortal';
import { useStyles } from './useStyles';
import { isNotUndefined } from '~/shared/utils/typescript';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (props: { close: () => void }) => React.ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  darkenBackground?: boolean;
  isOpen?: boolean;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  triggerRef?: React.MutableRefObject<HTMLElement | null>;
  width?: number;
};

export const OverlayCard: React.FC<OverlayCardProps> = ({
  align,
  children,
  className,
  closeOnOutsideClick = true,
  darkenBackground,
  isOpen: isOpenProp,
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
    wrapperRef.current = null;
  }, [animateOut, onClose, wrapperRef]);

  const open = useCallback(async () => {
    setIsOpen(true);
    onOpen?.();
    setTimeout(() => {
      updateStyles();
    });
  }, [onOpen, updateStyles]);

  useEffect(() => {
    if (isOpenProp === undefined) return;
    if (isOpenProp) {
      open();
    } else {
      close();
    }
  }, [close, isOpenProp, open]);

  useEffect(() => {
    const trigger = triggerRef?.current;
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
    disabled: !closeOnOutsideClick,
    additionalRefs: useMemo(() => [localRef, triggerRef].filter(isNotUndefined), [triggerRef]),
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
        <div
          className={classNames(
            'pointer-events-none fixed left-0 top-0 z-30 h-screen w-screen overflow-hidden',
            {
              '!pointer-events-auto bg-black/75': darkenBackground,
            },
          )}
        >
          <div
            className="absolute opacity-0"
            ref={(wrapper) => {
              if (wrapper && !wrapperRef.current) {
                animateIn(wrapper);
                wrapperRef.current = wrapper;
              }
            }}
          >
            <div
              className={classNames(
                'pointer-events-auto overflow-auto rounded-xl border border-border bg-card shadow-xl [max-height:inherit]',
                className,
              )}
              ref={refs}
            >
              {children(childrenProps)}
            </div>
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
