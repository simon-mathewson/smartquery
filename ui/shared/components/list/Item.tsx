import classNames from 'classnames';
import React from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import type { ListProps } from './List';

export type ListItemProps<T> = ButtonProps & {
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    tooltip?: string;
  }>;
  listVariant?: ListProps<unknown>['variant'];
  onSelect: () => void;
  selected?: boolean;
  value: T;
};

export function ListItem<T>(props: ListItemProps<T>) {
  const {
    actions,
    color = 'secondary',
    htmlProps,
    listVariant,
    onSelect,
    selected,
    ...otherProps
  } = props;

  return (
    <Button
      {...otherProps}
      align="left"
      htmlProps={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(htmlProps as any),
        'aria-selected': selected,
        className: classNames(
          'sm:min-h-[32px] min-h-[44px] gap-3 w-full !px-2 !py-2 sm:py-1.5 sm:px-2 h-auto text-sm last:border-b-0 sm:!text-xs last:rounded-b-xl rounded-none first:rounded-t-xl border-b border-borderLight',
          {
            '[&_svg]:text-textTertiary': otherProps.icon,
            'border-b-0 rounded-xl': listVariant === 'select',
            'rounded-xl border-b-0': selected,
          },
          htmlProps?.className,
        ),
        onClick: (event) => {
          event.stopPropagation();
          onSelect();
        },
        role: 'option',
        tabIndex: htmlProps?.disabled ? -1 : 0,
      }}
      suffix={actions?.map((action, index) => (
        <Button
          color={selected ? 'white' : 'primary'}
          htmlProps={{
            'aria-label': action.label,
            onClick: (event) => {
              event.stopPropagation();
              event.preventDefault();
              action.onClick();
            },
          }}
          icon={action.icon}
          key={index}
          tooltip={action.tooltip}
        />
      ))}
      color={selected ? 'primary' : color}
      variant={selected ? 'filled' : 'default'}
    />
  );
}
