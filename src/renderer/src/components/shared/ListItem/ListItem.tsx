import classNames from 'classnames';
import React from 'react';
import { Button } from '../Button/Button';

export type ListItemProps = {
  actions?: Array<{ icon: React.ReactNode; onClick: () => void }>;
  className?: string;
  hint?: string;
  label?: string;
  onClick?: () => void;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
  selectedVariant?: 'primary' | 'secondary';
};

export const ListItem: React.FC<ListItemProps> = (props) => {
  const {
    actions,
    className,
    hint,
    label,
    onClick,
    onMouseDown,
    selected,
    selectedVariant = 'secondary',
  } = props;

  return (
    <div
      className={classNames(
        'grid w-full cursor-pointer grid-cols-[1fr_max-content] gap-2 rounded-md px-2 py-1.5',
        {
          'bg-blue-500': selectedVariant === 'primary' && selected,
          'bg-gray-200': selectedVariant === 'secondary' && selected,
          'hover:bg-gray-200': !selected,
        },
        className,
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="overflow-hidden">
        <div
          className={classNames(
            'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-gray-600',
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
              'overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500',
              {
                'text-white/70': selectedVariant === 'primary' && selected,
              },
            )}
          >
            {hint}
          </div>
        )}
      </div>
      {actions?.map((action, index) => (
        <Button
          icon={action.icon}
          key={index}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
          variant={selected ? 'light' : 'secondary'}
        />
      ))}
    </div>
  );
};
