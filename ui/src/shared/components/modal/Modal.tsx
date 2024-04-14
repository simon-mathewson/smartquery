import type { PropsWithChildren } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import type { ModalControl } from './types';

export type ModalProps = PropsWithChildren<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModalControl<any, any> & {
    className?: string;
    title?: string;
  }
>;

export const Modal = (props: ModalProps) => {
  const { children, className, close, isOpen, title } = props;

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
          {title && <div className="truncate px-1 pb-2 pt-1 text-lg font-medium">{title}</div>}
          {children}
        </>
      )}
    </OverlayCard>
  );
};
