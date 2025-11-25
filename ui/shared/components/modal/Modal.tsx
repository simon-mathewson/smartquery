import { useState, type PropsWithChildren } from 'react';
import { OverlayCard } from '../overlayCard/OverlayCard';
import type { ModalControl } from './types';
import { v4 as uuid } from 'uuid';
import { useOverlay } from '../overlay/useOverlay';
import classNames from 'classnames';

export type ModalProps = PropsWithChildren<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalControl<any> & {
    htmlProps?: React.HTMLProps<HTMLDivElement>;
    subtitle?: string;
    title?: string;
  }
>;

export const Modal = (props: ModalProps) => {
  const { children, close, htmlProps, isOpen, subtitle, title } = props;

  const [titleId] = useState(() => uuid());
  const [subtitleId] = useState(() => uuid());

  const overlay = useOverlay({
    closeOnOutsideClick: false,
    darkenBackground: true,
    isOpen,
    onClose: close,
  });

  return (
    <OverlayCard
      htmlProps={{
        ...htmlProps,
        'aria-describedby': subtitleId,
        'aria-labelledby': titleId,
        'aria-modal': true,
        role: 'dialog',
        className: classNames('p-3 mx-2', htmlProps?.className),
      }}
      overlay={overlay}
    >
      {() => (
        <>
          {(title || subtitle) && (
            <div className="mb-3 flex flex-col gap-1">
              {title && (
                <h1 className="truncate text-center text-lg font-medium" id={titleId}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <h2 className="truncate text-center text-xs text-textTertiary" id={subtitleId}>
                  {subtitle}
                </h2>
              )}
            </div>
          )}
          {children}
        </>
      )}
    </OverlayCard>
  );
};
