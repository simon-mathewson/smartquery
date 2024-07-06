import { useClickOutside } from '~/shared/hooks/useClickOutside/useClickOutside';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import classNames from 'classnames';
import { OverlayPortal } from '../overlayPortal/OverlayPortal';
import { useStyles } from './useStyles';
import { isNotNull, isNotUndefined } from '~/shared/utils/typescript';
import { Card } from '../card/Card';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (props: { close: () => Promise<void> }) => React.ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
  darkenBackground?: boolean;
  id?: string;
  isOpen?: boolean;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  position?: {
    x: 'left' | 'center' | 'right';
    y: 'top' | 'center' | 'bottom';
  };
  role?: string;
  triggerRef?: React.MutableRefObject<HTMLElement | null>;
  width?: number;
};

export const OverlayCard: React.FC<OverlayCardProps> = (props) => {
  const {
    align,
    children,
    className,
    closeOnOutsideClick = true,
    darkenBackground,
    id,
    isOpen: isOpenProp,
    matchTriggerWidth = false,
    onClose,
    onOpen,
    position,
    role,
    triggerRef,
    anchorRef = triggerRef,
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const {
    animateInBackground,
    animateOutBackground,
    animateInWrapper,
    animateOutWrapper,
    backgroundRef,
    registerContent,
    updateStyles,
    wrapperRef,
  } = useStyles({
    align,
    anchorRef,
    matchTriggerWidth,
    position,
  });

  const close = useCallback(async () => {
    await Promise.all(
      [animateOutWrapper(), darkenBackground ? animateOutBackground() : null].filter(isNotNull),
    );
    setIsOpen(false);
    onClose?.();
    wrapperRef.current = null;
    backgroundRef.current = null;
  }, [
    animateOutBackground,
    animateOutWrapper,
    backgroundRef,
    darkenBackground,
    onClose,
    wrapperRef,
  ]);

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
  }, [animateInWrapper, close, isOpen, open, triggerRef, updateStyles]);

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
              '!pointer-events-auto': darkenBackground,
            },
          )}
          ref={(background) => {
            if (background && !backgroundRef.current) {
              if (darkenBackground) {
                animateInBackground(background);
              }
              backgroundRef.current = background;
            }
          }}
        >
          <div
            className="absolute opacity-0"
            ref={(wrapper) => {
              if (wrapper && !wrapperRef.current) {
                animateInWrapper(wrapper);
                wrapperRef.current = wrapper;
              }
            }}
          >
            <Card
              className={classNames(
                'pointer-events-auto shadow-2xl [max-height:inherit]',
                className,
              )}
              id={id}
              ref={refs}
              role={role}
            >
              {children(childrenProps)}
            </Card>
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
