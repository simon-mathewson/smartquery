import React, { useRef } from 'react';
import { OverlayCard } from '../OverlayCard/OverlayCard';
import { ExpandMore } from '@mui/icons-material';

export type SelectProps = {
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string | null;
};

export const Select: React.FC<SelectProps> = (props) => {
  const { onChange, options, value: selectedValue } = props;

  const triggerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(({ value }) => value === selectedValue);

  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-200"
        ref={triggerRef}
      >
        <div className="overflow-hidden text-ellipsis">{selectedOption?.label}</div>
        <ExpandMore className="text-gray-400" />
      </div>
      <OverlayCard className="py-2" matchTriggerWidth triggerRef={triggerRef}>
        {(close) =>
          options.map(({ label, value }) => (
            <div
              className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
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
