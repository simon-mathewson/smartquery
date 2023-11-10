import classNames from 'classnames';
import React from 'react';

export type ListItemProps = {
  hint?: string;
  label?: string;
  onClick?: () => void;
  selected?: boolean;
  selectedVariant?: 'primary' | 'secondary';
};

export const ListItem: React.FC<ListItemProps> = (props) => {
  const { hint, label, onClick, selected, selectedVariant = 'secondary' } = props;

  return (
    <div
      className={classNames('w-full cursor-pointer rounded-md px-2 py-1.5', {
        'bg-blue-500': selectedVariant === 'primary' && selected,
        'bg-gray-200': selectedVariant === 'secondary' && selected,
        'hover:bg-gray-200': !selected,
      })}
      onClick={onClick}
    >
      <div
        className={classNames('text-xs font-medium text-gray-600', {
          'text-white': selectedVariant === 'primary' && selected,
        })}
      >
        {label}
      </div>
      {hint && (
        <div
          className={classNames('text-xs text-gray-500', {
            'text-white/70': selectedVariant === 'primary' && selected,
          })}
        >
          {hint}
        </div>
      )}
    </div>
  );
};
