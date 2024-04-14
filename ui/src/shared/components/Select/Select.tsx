import { useRef } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';

export type SelectProps<T> = {
  className?: string;
  monospace?: boolean;
  placeholder?: string;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
  value: T | null;
};

export function Select<T>(props: SelectProps<T>) {
  const { className, monospace, onChange, options, placeholder, value: selectedValue } = props;

  const triggerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(({ value }) => value === selectedValue);

  return (
    <>
      <div
        className={classNames(
          'flex h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-[1.5px] border-border bg-background px-2 outline-none hover:bg-secondaryHighlight focus:border-primary',
          className,
        )}
        ref={triggerRef}
        tabIndex={0}
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
      </div>
      <OverlayCard className="px-0 py-2" matchTriggerWidth triggerRef={triggerRef}>
        {({ close }) =>
          options.map(({ label, value }) => (
            <div
              className={classNames(
                'cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-sm font-medium text-textSecondary',
                {
                  'bg-primary text-white': value === selectedValue,
                  'hover:bg-secondaryHighlight': value !== selectedValue,
                  'font-mono': monospace,
                },
              )}
              key={label}
              onClick={() => {
                onChange(value);
                close();
              }}
            >
              {label}
            </div>
          ))
        }
      </OverlayCard>
    </>
  );
}
