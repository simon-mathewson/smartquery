import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useOverlay } from '../overlay/useOverlay';
import { OverlayCard } from '../overlayCard/OverlayCard';
import { List, type ListProps } from '../list/List';
import { Button } from '../button/Button';
import type { ButtonProps } from '../button/Button';

export type DropdownMenuProps<T> = {
  items: ListProps<T>['items'];
  trigger: ButtonProps;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
} & Omit<ListProps<T>, 'items' | 'htmlProps' | 'multiple' | 'selectedValue' | 'selectedValues'> &
  ({ multiple?: false; selectedValue?: T | null } | { multiple: true; selectedValues: T[] });

export const DropdownMenu = <T,>(props: DropdownMenuProps<T>) => {
  const { items, trigger, htmlProps, ...listProps } = props;

  const [menuId] = useState(() => uuid());

  const menuOverlay = useOverlay({
    align: 'right',
  });

  return (
    <div {...htmlProps}>
      <Button
        {...trigger}
        htmlProps={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(trigger.htmlProps as any),
          'aria-controls': menuId,
          'aria-expanded': menuOverlay.isOpen,
          'aria-haspopup': 'menu',
          role: 'menuitem',
          type: 'button',
          ...menuOverlay.triggerProps,
        }}
      />
      <OverlayCard
        htmlProps={{
          className: '!p-0',
          id: menuId,
          role: 'menu',
        }}
        overlay={menuOverlay}
      >
        {() => <List<T> items={items} {...listProps} />}
      </OverlayCard>
    </div>
  );
};
