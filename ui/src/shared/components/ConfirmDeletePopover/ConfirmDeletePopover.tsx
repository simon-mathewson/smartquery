import React, { useRef } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { Button } from '../Button/Button';

export type ConfirmDeletePopoverProps = {
  onConfirm: () => void;
  renderTrigger: (props: { ref: React.RefObject<HTMLButtonElement | null> }) => React.ReactNode;
  text: string;
};

export const ConfirmDeletePopover: React.FC<ConfirmDeletePopoverProps> = (props) => {
  const { onConfirm, renderTrigger, text } = props;

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      {renderTrigger({ ref: triggerRef })}
      <OverlayCard align="right" className="p-2" triggerRef={triggerRef}>
        {() => (
          <div className="flex justify-end gap-2 whitespace-nowrap">
            <Button label={text} onClick={onConfirm} variant="danger" />
          </div>
        )}
      </OverlayCard>
    </>
  );
};
