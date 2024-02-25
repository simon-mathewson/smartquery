import React, { useRef } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';

export type SelectProps = {
  placeholder?: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string | null;
};

export const Select: React.FC<SelectProps> = (props) => {
  const { onChange, options, placeholder, value: selectedValue } = props;

  const triggerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(({ value }) => value === selectedValue);

  return (
    <>
      <div
        className="border-border bg-background hover:bg-secondaryHighlight focus:border-primary flex h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-[1.5px] px-2 outline-none"
        ref={triggerRef}
        tabIndex={0}
      >
        <div
          className={classNames(
            'text-textSecondary overflow-hidden text-ellipsis text-sm font-medium',
            {
              '!text-textTertiary': !selectedOption,
            },
          )}
        >
          {selectedOption?.label ?? placeholder ?? 'Select'}
        </div>
        <ExpandMore className="text-secondary" />
      </div>
      <OverlayCard className="py-2" matchTriggerWidth triggerRef={triggerRef}>
        {({ close }) =>
          options.map(({ label, value }) => (
            <div
              className={classNames(
                'text-textSecondary cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-sm font-medium',
                {
                  'bg-primary text-white': value === selectedValue,
                  'hover:bg-secondaryHighlight': value !== selectedValue,
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
};
