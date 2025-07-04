import classNames from 'classnames';
import React, { useMemo } from 'react';
import { OverlayPortal } from '../overlayPortal/OverlayPortal';
import { useOverlay } from './useOverlay';

export type OverlayChildrenControlProps = {
  close: () => Promise<void>;
  open: () => void;
};

export type OverlayChildrenRootProps = {
  htmlProps: React.HTMLProps<HTMLDivElement>;
};

export type OverlayChildrenProps = {
  control: OverlayChildrenControlProps;
  root: OverlayChildrenRootProps;
};

export type OverlayProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (props: OverlayChildrenProps) => React.ReactNode;
  closeOnOutsideClick?: boolean;
  darkenBackground?: boolean;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  isOpen?: boolean;
  matchTriggerWidth?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  position?: {
    x: 'left' | 'center' | 'right';
    y: 'top' | 'center' | 'bottom';
  };
  triggerRef?: React.MutableRefObject<HTMLElement | null>;
};

export const Overlay: React.FC<OverlayProps> = (props) => {
  const { children, darkenBackground, htmlProps } = props;

  const {
    childrenProps: childrenControlProps,
    isOpen,
    ref,
    styles: { animateInBackground, animateInWrapper, backgroundRef, wrapperRef },
  } = useOverlay(props);

  const childrenProps = useMemo(
    () =>
      ({
        control: childrenControlProps,
        root: {
          htmlProps: {
            ...htmlProps,
            className: classNames(
              'pointer-events-auto shadow-2xl [max-height:inherit]',
              htmlProps?.className,
            ),
            ref,
          },
        },
      }) satisfies OverlayChildrenProps,
    [htmlProps, ref, childrenControlProps],
  );

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
            setTimeout(() => {
              if (background && !backgroundRef.current) {
                if (darkenBackground) {
                  animateInBackground(background);
                }
                backgroundRef.current = background;
              }
            }, 10);
          }}
        >
          <div
            className="absolute opacity-0"
            ref={(wrapper) => {
              setTimeout(() => {
                if (wrapper && !wrapperRef.current) {
                  animateInWrapper(wrapper);
                  wrapperRef.current = wrapper;
                }
              }, 10);
            }}
          >
            {children(childrenProps)}
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
