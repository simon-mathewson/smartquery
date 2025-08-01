import classNames from 'classnames';
import React from 'react';
import { Button } from '../button/Button';
import { autoFocusClass } from '~/shared/utils/focusFirstControl/focusFirstControl';
import { Link } from 'wouter';

export type ListItemProps<T> = {
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    tooltip?: string;
  }>;
  autoFocus?: boolean;
  hint?: string;
  htmlProps?: React.HTMLProps<HTMLDivElement> | React.HTMLProps<HTMLAnchorElement>;
  icon?: React.ReactNode;
  label?: string;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onSelect: () => void;
  selected?: boolean;
  selectedVariant?: 'primary' | 'secondary';
  value: T;
};

export function ListItem<T>(props: ListItemProps<T>) {
  const {
    actions,
    autoFocus,
    hint,
    htmlProps,
    icon,
    label,
    onMouseDown,
    onSelect,
    selected,
    selectedVariant = 'secondary',
  } = props;

  const Element = htmlProps?.href ? Link : 'div';

  return (
    <Element
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(htmlProps as any)}
      aria-selected={selected}
      className={classNames(
        'grid w-full cursor-pointer select-none grid-cols-[1fr_max-content] gap-2 rounded-md px-2 py-1.5',
        {
          'bg-primary hover:bg-primaryHover': selectedVariant === 'primary' && selected,
          'bg-secondaryHighlight hover:bg-secondaryHighlightHover':
            selectedVariant === 'secondary' && selected,
          'hover:bg-secondaryHighlight focus:bg-secondaryHighlight': !selected,
          [autoFocusClass]: autoFocus,
          '!grid-cols-[max-content_1fr_max-content] [&_svg]:text-textTertiary': icon,
        },
        htmlProps?.className,
      )}
      onClick={onSelect}
      onMouseDown={onMouseDown}
      role="option"
      tabIndex={0}
    >
      {icon && <div className="pr-2">{icon}</div>}
      <div className="flex flex-col justify-center overflow-hidden">
        <div
          className={classNames(
            'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-textSecondary',
            {
              'text-white': selectedVariant === 'primary' && selected,
            },
          )}
        >
          {label}
        </div>
        {hint && (
          <div
            className={classNames(
              'overflow-hidden text-ellipsis whitespace-nowrap text-xs text-textTertiary',
              {
                'text-whiteHover': selectedVariant === 'primary' && selected,
              },
            )}
          >
            {hint}
          </div>
        )}
      </div>
      {actions?.map((action, index) => (
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
    </Element>
  );
}
