import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button } from '../button/Button';
import { useOverlay } from '../overlay/useOverlay';
import { OverlayCard } from '../overlayCard/OverlayCard';

export type ConfirmDeletePopoverProps = {
  onConfirm: () => Promise<void> | void;
  renderTrigger: (props: React.HTMLProps<HTMLButtonElement>) => React.ReactNode;
  text: string;
};

export const ConfirmDeletePopover: React.FC<ConfirmDeletePopoverProps> = (props) => {
  const { onConfirm, renderTrigger, text } = props;

  const [menuId] = useState(uuid);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const overlay = useOverlay({
    align: 'right',
    onClose: () => setIsOpen(false),
    onOpen: () => setIsOpen(true),
  });

  const triggerProps = {
    'aria-controls': menuId,
    'aria-expanded': isOpen,
    'aria-haspopup': 'menu',
    'aria-label': text,
    ...overlay.triggerProps,
  } as const;

  return (
    <>
      {renderTrigger(triggerProps)}
      <OverlayCard
        htmlProps={{
          id: menuId,
          role: 'menu',
        }}
        overlay={overlay}
      >
        {({ close }) => (
          <Button
            color="danger"
            htmlProps={{
              disabled: isLoading,
              onClick: async () => {
                try {
                  setIsLoading(true);
                  await onConfirm();
                  void close();
                } finally {
                  setIsLoading(false);
                }
              },
              role: 'menuitem',
            }}
            label={text}
          />
        )}
      </OverlayCard>
    </>
  );
};
