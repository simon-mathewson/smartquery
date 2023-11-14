import classNames from 'classnames';

export type ListItemProps = {
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
        'w-full cursor-pointer rounded-md px-2 py-1.5',
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
