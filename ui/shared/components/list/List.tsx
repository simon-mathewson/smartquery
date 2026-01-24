import classNames from 'classnames';
import { ListItem, type ListItemProps } from './Item';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { Input } from '../input/Input';
import SearchIcon from '~/shared/icons/Search.svg?react';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';

export type ListProps<T> = {
  autoFocusFirstItem?: boolean;
  compareFn?: (a: T | null, b: T | null) => boolean;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  emptyPlaceholder?: string;
  items: Array<
    Omit<ListItemProps<T>, 'onSelect' | 'selected'> & Partial<Pick<ListItemProps<T>, 'onSelect'>>
  >;
  onSelect?: (value: T) => void;
  search?: string;
  searchAutofocus?: boolean;
  searchPlaceholder?: string;
  setSearch?: (value: string) => void;
  variant?: 'select' | 'default';
} & ({ multiple?: false; selectedValue?: T | null } | { multiple: true; selectedValues: T[] });

export function List<T>(props: ListProps<T>) {
  const {
    autoFocusFirstItem,
    compareFn = (a, b) => a === b,
    emptyPlaceholder,
    htmlProps,
    items,
    multiple,
    onSelect,
    search,
    searchAutofocus,
    searchPlaceholder,
    setSearch,
    variant = 'default',
  } = props;

  const isMobile = useIsMobile();

  const { onKeyDown } = useKeyboardNavigation();

  const getAutoFocus = (item: (typeof items)[number], index: number) => {
    if (
      (multiple && props.selectedValues.length > 0) ||
      (!multiple && (props.selectedValue ?? null) !== null)
    ) {
      return (multiple && compareFn(props.selectedValues[0], item.value)) ||
        (!multiple && compareFn(props.selectedValue ?? null, item.value))
        ? true
        : undefined;
    }

    return autoFocusFirstItem && index === 0 ? true : undefined;
  };

  return (
    <>
      {search !== undefined && setSearch && (
        <Input
          htmlProps={{
            'aria-label': searchPlaceholder,
            autoFocus: searchAutofocus,
            className: 'mb-2',
            placeholder: searchPlaceholder,
            type: 'search',
            value: search,
          }}
          icon={<SearchIcon />}
          onChange={setSearch}
          small={!isMobile}
        />
      )}
      {items.length === 0 ? (
        <div className="py-1 text-center text-xs">{search ? 'No results' : emptyPlaceholder}</div>
      ) : (
        <div
          {...htmlProps}
          aria-multiselectable={multiple}
          className={classNames(
            'focus-invisible flex w-full flex-col overflow-y-auto',
            { 'rounded-2xl bg-card p-2': variant === 'default' },
            htmlProps?.className,
          )}
          onKeyDown={onKeyDown}
          role="listbox"
          tabIndex={0}
        >
          {items.map((item, index) => (
            <ListItem<T>
              key={index}
              onSelect={() => onSelect?.(item.value)}
              listVariant={variant}
              {...item}
              htmlProps={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(item.htmlProps as any),
                autoFocus: getAutoFocus(item, index),
              }}
              selected={
                multiple
                  ? props.selectedValues.some((selectedValue) =>
                      compareFn(selectedValue, item.value),
                    )
                  : compareFn(props.selectedValue ?? null, item.value)
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
