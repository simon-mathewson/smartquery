import classNames from 'classnames';
import { ListItem, type ListItemProps } from './Item';
import { useKeyboardNavigation } from './useKeyboardNavigation';

export type ListProps<T extends string> = {
  autoFocusFirstItem?: boolean;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  emptyPlaceholder?: string;
  items: Omit<ListItemProps<T>, 'onSelect' | 'selected'>[];
  onSelect?: (value: T) => void;
} & ({ multiple?: false; selectedValue: T | null } | { multiple: true; selectedValues: T[] });

export const List = <T extends string>(props: ListProps<T>) => {
  const { autoFocusFirstItem, emptyPlaceholder, htmlProps, items, multiple, onSelect } = props;

  const { onKeyDown } = useKeyboardNavigation();

  if (items.length === 0) {
    return <div className="py-1 text-center text-xs">{emptyPlaceholder}</div>;
  }

  const getAutoFocus = (item: (typeof items)[number], index: number) => {
    if (autoFocusFirstItem) {
      if (index === 0) return true;
      return undefined;
    }

    if (multiple) {
      return props.selectedValues[0] === item.value;
    }

    return props.selectedValue === item.value;
  };

  return (
    <div
      {...htmlProps}
      aria-multiselectable={multiple}
      className={classNames('flex w-full flex-col gap-1', htmlProps?.className)}
      onKeyDown={onKeyDown}
      role="listbox"
      tabIndex={0}
    >
      {items.map((item, index) => (
        <ListItem<T>
          key={index}
          {...item}
          autoFocus={getAutoFocus(item, index)}
          onSelect={() => onSelect?.(item.value)}
          selected={
            multiple
              ? props.selectedValues.includes(item.value)
              : props.selectedValue === item.value
          }
        />
      ))}
    </div>
  );
};
