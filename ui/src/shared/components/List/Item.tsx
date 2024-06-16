import classNames from 'classnames';
import React, { useCallback } from 'react';
import { Button } from '../Button/Button';

export type ListItemProps = {
  actions?: Array<{ icon: React.ReactNode; onClick: () => void }>;
  className?: string;
  hint?: string;
  label?: string;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onSelect?: () => void;
  selected?: boolean;
  selectedVariant?: 'primary' | 'secondary';
};

export const ListItem: React.FC<ListItemProps> = (props) => {
  const {
    actions,
    className,
    hint,
    label,
    onMouseDown,
    onSelect,
    selected,
    selectedVariant = 'secondary',
  } = props;

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (['Enter', ' '].includes(event.key)) {
        onSelect?.();
      }
    },
    [onSelect],
  );

  return (
    <div
      aria-selected={selected}
      className={classNames(
        'grid w-full cursor-pointer select-none grid-cols-[1fr_max-content] gap-2 rounded-md px-2 py-1.5',
        {
          'bg-primary hover:bg-primaryHover': selectedVariant === 'primary' && selected,
          'bg-secondaryHighlight hover:bg-secondaryHighlightHover':
            selectedVariant === 'secondary' && selected,
          'hover:bg-secondaryHighlight focus:bg-secondaryHighlight': !selected,
        },
        className,
      )}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      role="option"
      tabIndex={0}
    >
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
