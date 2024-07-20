import classNames from 'classnames';
import { ListItem, type ListItemProps } from './Item';
import { useKeyboardNavigation } from './useKeyboardNavigation';

export type ListProps = {
  autoFocusFirstItem?: boolean;
  className?: string;
  emptyPlaceholder?: string;
  items: ListItemProps[];
};

export const List: React.FC<ListProps> = (props) => {
  const { autoFocusFirstItem, className, emptyPlaceholder, items } = props;

  const { onKeyDown } = useKeyboardNavigation();

  if (items.length === 0) {
    return <div className="py-1 text-center text-xs">{emptyPlaceholder}</div>;
  }

  return (
    <div
      className={classNames('flex w-full flex-col gap-1', className)}
      onKeyDown={onKeyDown}
      role="listbox"
      tabIndex={0}
    >
      {items.map((item, index) => (
        <ListItem key={index} {...item} autoFocus={index === 0 && autoFocusFirstItem} />
      ))}
    </div>
  );
};
