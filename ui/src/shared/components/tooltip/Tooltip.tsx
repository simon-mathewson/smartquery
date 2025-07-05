import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { Overlay } from '../overlay/Overlay';
import type { UseOverlayProps } from '../overlay/useOverlay';
import { useOverlay } from '../overlay/useOverlay';

export type TooltipProps<T extends HTMLElement> = {
  children: (childrenProps: { htmlProps: React.HTMLProps<T> }) => React.ReactNode;
  text?: string;
  overlayProps?: UseOverlayProps;
};

export const Tooltip = <T extends HTMLElement>(props: TooltipProps<T>) => {
  const { children, text, overlayProps } = props;

  const anchorRef = useRef<T>(null);

  const overlay = useOverlay({
    ...overlayProps,
    align: 'center',
    anchorRef,
    closeOnOutsideClick: false,
    styleOptions: {
      overlayMargin: 4,
      animationVerticalOffset: 8,
    },
  });

  const onMouseEnter = useCallback(() => {
    overlay.open();
  }, [overlay]);

  const onMouseLeave = useCallback(() => {
    overlay.close();
  }, [overlay]);

  if (!text) {
    return children({ htmlProps: { ref: anchorRef } });
  }

  return (
    <>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children({ htmlProps: { ref: anchorRef } })}
      </div>
      <Overlay overlay={overlay}>
        {({ root }) => (
          <div
            {...root.htmlProps}
            className={classNames(
              'rounded-xl bg-background bg-opacity-80 px-1.5 py-0.5 text-xs font-medium text-textPrimary light:dark dark:light',
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
