import React, { useMemo, useRef, useState } from 'react';
import { OverlayCard } from '../overlayCard/OverlayCard';
import { v4 as uuid } from 'uuid';
import { Button } from '../button/Button';

export type ConfirmDeletePopoverProps = {
  onConfirm: () => void;
  renderTrigger: (props: React.HTMLProps<HTMLButtonElement>) => React.ReactNode;
  text: string;
};

export const ConfirmDeletePopover: React.FC<ConfirmDeletePopoverProps> = (props) => {
  const { onConfirm, renderTrigger, text } = props;

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const [menuId] = useState(uuid);
  const [isOpen, setIsOpen] = useState(false);

  const triggerProps = useMemo(
    () =>
      ({
        'aria-controls': menuId,
        'aria-expanded': isOpen,
        'aria-haspopup': 'menu',
        'aria-label': text,
        ref: triggerRef,
      }) as const,
    [isOpen, menuId, text],
  );

  return (
    <>
      {renderTrigger(triggerProps)}
      <OverlayCard
        align="right"
        htmlProps={{
          id: menuId,
          role: 'menu',
        }}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        triggerRef={triggerRef}
      >
        {() => (
          <Button
            color="danger"
            htmlProps={{ onClick: onConfirm, role: 'menuitem' }}
            label={text}
          />
        )}
      </OverlayCard>
    </>
  );
};
