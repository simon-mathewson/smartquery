import classNames from 'classnames';
import React from 'react';
import { Card } from '../card/Card';
import { OverlayPortal } from '../overlayPortal/OverlayPortal';
import { useOverlayCard } from './useOverlayCard';

export type OverlayCardProps = {
  align?: 'left' | 'center' | 'right';
  anchorRef?: React.MutableRefObject<HTMLElement | null>;
  children: (props: { close: () => Promise<void> }) => React.ReactNode;
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

export const OverlayCard: React.FC<OverlayCardProps> = (props) => {
  const { children, darkenBackground, htmlProps } = props;

  const {
    childrenProps,
    isOpen,
    ref,
    styles: { animateInBackground, animateInWrapper, backgroundRef, wrapperRef },
  } = useOverlayCard(props);

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
            <Card
              htmlProps={{
                ...htmlProps,
                className: classNames(
                  'pointer-events-auto shadow-2xl [max-height:inherit]',
                  htmlProps?.className,
                ),
                ref,
              }}
            >
              {children(childrenProps)}
            </Card>
          </div>
        </div>
      )}
    </OverlayPortal>
  );
};
