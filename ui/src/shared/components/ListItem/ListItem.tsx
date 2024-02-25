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
          'bg-primary hover:bg-primaryHover': selectedVariant === 'primary' && selected,
          'bg-secondaryHighlight hover:bg-secondaryHighlightHover':
            selectedVariant === 'secondary' && selected,
          'hover:bg-secondaryHighlight': !selected,
        },
        className,
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className="overflow-hidden">
        <div
          className={classNames(
            'text-textSecondary overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium',
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
              'text-textTertiary overflow-hidden text-ellipsis whitespace-nowrap text-xs',
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
          icon={action.icon}
          key={index}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
          color={selected ? 'white' : 'primary'}
        />
      ))}
    </div>
  );
};
