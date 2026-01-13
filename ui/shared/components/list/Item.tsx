import classNames from 'classnames';
import React from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';

export type ListItemProps<T> = ButtonProps & {
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    tooltip?: string;
  }>;
  onSelect: () => void;
  selected?: boolean;
  selectedVariant?: 'primary' | 'secondary';
  value: T;
};

export function ListItem<T>(props: ListItemProps<T>) {
  const {
    actions,
    color = 'secondary',
    htmlProps,
    onSelect,
    selected,
    selectedVariant = 'secondary',
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
          'w-full px-2 py-2 sm:py-1.5 sm:px-2 h-auto text-sm sm:!text-xs rounded-lg',
          {
            '[&_svg]:text-textTertiary': otherProps.icon,
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
              action.onClick();
            },
          }}
          icon={action.icon}
          key={index}
          tooltip={action.tooltip}
        />
      ))}
      color={selected ? selectedVariant : color}
      variant={selected ? 'filled' : 'default'}
    />
  );
}
