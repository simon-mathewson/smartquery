import classNames from 'classnames';
import React, { useMemo } from 'react';
import { OverlayPortal } from '../overlayPortal/OverlayPortal';
import type { OverlayControl } from './useOverlay';

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
  children: (props: OverlayChildrenProps) => React.ReactNode;
  overlay: OverlayControl;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
};

export const Overlay: React.FC<OverlayProps> = (props) => {
  const {
    children,
    overlay: {
      childrenProps: childrenControlProps,
      darkenBackground,
      isOpen,
      ref,
      styles: { animateInBackground, animateInWrapper, backgroundRef, wrapperRef },
    },
    htmlProps,
  } = props;

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
            'pointer-events-none fixed left-0 top-0 z-50 h-screen w-screen overflow-hidden',
            {
              '!pointer-events-auto': darkenBackground,
            },
          )}
          ref={(background) => {
            if (background && !backgroundRef.current) {
              if (darkenBackground) {
                void animateInBackground(background);
              }
              backgroundRef.current = background;
            }
          }}
        >
          <div
            className="absolute opacity-0"
            ref={(wrapper) => {
              if (wrapper && !wrapperRef.current) {
                void animateInWrapper(wrapper);
                wrapperRef.current = wrapper;
              }
            }}
          >
            {children(childrenProps)}
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
