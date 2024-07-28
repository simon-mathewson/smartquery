import { useContext, useRef, useState } from 'react';
import { OverlayCard } from '../overlayCard/OverlayCard';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';
import { v4 as uuid } from 'uuid';
import { FieldContext } from '../field/FieldContext';
import { List } from '../list/List';

export type SelectProps<T extends string> = {
  htmlProps?: React.HTMLProps<HTMLButtonElement>;
  monospace?: boolean;
  placeholder?: string;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T | null;
};

export function Select<T extends string>(props: SelectProps<T>) {
  const { htmlProps, monospace, onChange, options, placeholder, value: selectedValue } = props;

  const fieldContext = useContext(FieldContext);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedOption = options.find(({ value }) => value === selectedValue);

  const [isOpen, setIsOpen] = useState(false);

  const [listboxId] = useState(uuid);

  return (
    <>
      <button
        {...htmlProps}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={classNames(
          'flex h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-[1.5px] border-border bg-background px-2 outline-none hover:bg-secondaryHighlight focus:border-primary',
          {
            'pointer-events-none': htmlProps?.disabled,
          },
          htmlProps?.className,
        )}
        id={fieldContext?.controlId}
        ref={triggerRef}
        type="button"
      >
        <div
          className={classNames(
            'overflow-hidden text-ellipsis text-sm font-medium text-textSecondary',
            {
              '!text-textTertiary': !selectedOption,
              'font-mono': monospace,
            },
          )}
        >
          {selectedOption?.label ?? placeholder ?? 'Select'}
        </div>
        <ExpandMore className="text-secondary" />
      </button>
      <OverlayCard
        htmlProps={{ className: 'p-1' }}
        matchTriggerWidth
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
        triggerRef={triggerRef}
      >
        {({ close }) => (
          <List
            htmlProps={{ id: listboxId }}
            items={options.map(({ label, value }) => ({
              htmlProps: {
                className: classNames(
                  'cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-sm font-medium text-textSecondary',
                  {
                    'bg-primary text-white': value === selectedValue,
                    'hover:bg-secondaryHighlight': value !== selectedValue,
                    'font-mono': monospace,
                  },
                ),
              },
              label,
              selectedVariant: 'primary',
              value,
            }))}
            onSelect={(value) => {
              onChange(value);
              close();
            }}
            selectedValue={selectedValue}
          />
        )}
      </OverlayCard>
    </>
  );
}
