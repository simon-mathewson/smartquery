import type { PropsWithChildren } from 'react';
import { OverlayCard } from '../overlayCard/OverlayCard';
import type { ModalControl } from './types';

export type ModalProps = PropsWithChildren<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalControl<any, any> & {
    className?: string;
    subtitle?: string;
    title?: string;
  }
>;

export const Modal = (props: ModalProps) => {
  const { children, className, close, isOpen, subtitle, title } = props;

  return (
    <OverlayCard
      className={className}
      closeOnOutsideClick={false}
      darkenBackground
      isOpen={isOpen}
      onClose={close}
    >
      {() => (
        <>
          {(title || subtitle) && (
            <div className="flex flex-col gap-1 pb-2 pt-1">
              {title && <div className="truncate text-center text-lg font-medium">{title}</div>}
              {subtitle && (
                <div className="truncate text-center text-xs text-textTertiary">{subtitle}</div>
              )}
            </div>
          )}
          {children}
        </>
      )}
    </OverlayCard>
  );
};
