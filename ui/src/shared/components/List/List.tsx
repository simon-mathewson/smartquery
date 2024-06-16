import classNames from 'classnames';
import { ListItem, type ListItemProps } from './Item';

export type ListProps = {
  className?: string;
  emptyPlaceholder?: string;
  items: ListItemProps[];
};

export const List: React.FC<ListProps> = (props) => {
  const { className, emptyPlaceholder, items } = props;

  if (items.length === 0) {
    return <div className="py-1 text-center text-xs">{emptyPlaceholder}</div>;
  }

  return (
    <div className={classNames('flex w-full flex-col gap-1', className)} role="listbox">
      {items.map((item, index) => (
        <ListItem key={index} {...item} />
      ))}
    </div>
  );
};
