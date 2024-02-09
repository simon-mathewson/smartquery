import React, { useRef } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { ExpandMore } from '@mui/icons-material';
import classNames from 'classnames';

export type SelectProps = {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string | null;
};

export const Select: React.FC<SelectProps> = (props) => {
  const { label, onChange, options, value: selectedValue } = props;

  const triggerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(({ value }) => value === selectedValue);

  return (
    <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
      {label && <div className="pl-1 text-xs font-medium">{label}</div>}
      <div
        className="flex h-[36px] w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-[1.5px] border-gray-300 bg-gray-50 px-2 outline-none hover:bg-gray-200 focus:border-blue-600"
        ref={triggerRef}
        tabIndex={0}
      >
        <div
          className={classNames('overflow-hidden text-ellipsis text-sm font-medium text-gray-700', {
            '!text-gray-500': !selectedOption,
          })}
        >
          {selectedOption?.label ?? 'Select'}
        </div>
        <ExpandMore className="text-gray-400" />
      </div>
      <OverlayCard className="py-2" matchTriggerWidth triggerRef={triggerRef}>
        {({ close }) =>
          options.map(({ label, value }) => (
            <div
              className={classNames(
                'cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-sm font-medium text-gray-600',
                {
                  'bg-blue-500 text-white': value === selectedValue,
                  'hover:bg-gray-200': value !== selectedValue,
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
    </label>
  );
};
