import { useState, type PropsWithChildren } from 'react';
import { OverlayCard } from '../overlayCard/OverlayCard';
import type { ModalControl } from './types';
import { v4 as uuid } from 'uuid';

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

  return (
    <OverlayCard
      closeOnOutsideClick={false}
      darkenBackground
      htmlProps={{
        ...htmlProps,
        'aria-describedby': subtitleId,
        'aria-labelledby': titleId,
        'aria-modal': true,
        role: 'dialog',
      }}
      isOpen={isOpen}
      onClose={close}
    >
      {() => (
        <>
          {(title || subtitle) && (
            <div className="flex flex-col gap-1 pb-2 pt-1">
              {title && (
                <div className="truncate text-center text-lg font-medium" id={titleId}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="truncate text-center text-xs text-textTertiary" id={subtitleId}>
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {children}
        </>
      )}
    </OverlayCard>
  );
};
