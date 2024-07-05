import React, { useMemo, useRef, useState } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { v4 as uuid } from 'uuid';
import { Button } from '../Button/Button';

export type ConfirmDeletePopoverProps = {
  onConfirm: () => void;
  renderTrigger: (props: {
    'aria-controls': string;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
    ref: React.RefObject<HTMLButtonElement | null>;
  }) => React.ReactNode;
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
        ref: triggerRef,
      }) as const,
    [isOpen, menuId],
  );

  return (
    <>
      {renderTrigger(triggerProps)}
      <OverlayCard
        align="right"
        id={menuId}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        role="menu"
        triggerRef={triggerRef}
      >
        {() => <Button color="danger" label={text} onClick={onConfirm} role="menuitem" />}
      </OverlayCard>
    </>
  );
};
