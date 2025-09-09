import classNames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
import { Overlay } from '../overlay/Overlay';
import type { UseOverlayProps } from '../overlay/useOverlay';
import { useOverlay } from '../overlay/useOverlay';

export type TooltipProps<T extends HTMLElement> = {
  children: (childrenProps: { htmlProps: React.HTMLProps<T> }) => React.ReactNode;
  delay?: number;
  overlayProps?: UseOverlayProps;
  role?: 'label' | 'description';
  text?: string;
};

export const Tooltip = <T extends HTMLElement>(props: TooltipProps<T>) => {
  const { children, delay = 1000, overlayProps, role = 'label', text } = props;

  const anchorRef = useRef<T>(null);

  const overlay = useOverlay({
    ...overlayProps,
    align: 'center',
    anchorRef,
    closeOnOutsideClick: false,
    styleOptions: {
      overlayMargin: 8,
      animationVerticalOffset: 16,
    },
  });

  const timeoutRef = useRef<number | null>(null);

  const onPointerEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void overlay.open();
    }, delay) as unknown as number;

    const listener = (moveEvent: MouseEvent) => {
      if (moveEvent.target instanceof Node && anchorRef.current?.contains(moveEvent.target)) {
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      void overlay.close();
      document.removeEventListener('mousemove', listener);
    };

    document.addEventListener('mousemove', listener, { passive: true });
  }, [overlay, delay]);

  useEffect(() => {
    if (!overlay.isOpen) {
      return;
    }

    const close = overlay.close;
    document.addEventListener('wheel', close, { passive: true });
    return () => document.removeEventListener('wheel', close);
  }, [overlay.close, overlay.isOpen]);

  if (!text) {
    return children({ htmlProps: { ref: anchorRef } });
  }

  return (
    <>
      {children({
        htmlProps: {
          'aria-label': role === 'label' ? text : undefined,
          'aria-description': role === 'description' ? text : undefined,
          onPointerEnter,
          ref: anchorRef,
        },
      })}
      <Overlay overlay={overlay}>
        {({ root }) => (
          <div
            {...root.htmlProps}
            className={classNames(
              '!pointer-events-none max-w-[160px] rounded-lg bg-background px-1.5 py-0.5 text-center text-xs font-medium text-textPrimary light:bg-opacity-70 light:dark dark:bg-opacity-90 dark:light',
              root.htmlProps.className,
            )}
          >
            {text}
          </div>
        )}
      </Overlay>
    </>
  );
};
