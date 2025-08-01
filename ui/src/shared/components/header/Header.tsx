import React from 'react';

export type HeaderProps = {
  left?: React.ReactNode;
  middle?: React.ReactNode;
  right?: React.ReactNode;
};

export const Header: React.FC<HeaderProps> = (props) => {
  const { left, middle, right } = props;

  return (
    <div className="grid h-9 shrink-0 grid-cols-[30%_1fr_30%] gap-2 text-sm font-medium text-textPrimary">
      <div className="flex items-center justify-start gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {left}
      </div>
      <div className="flex items-center justify-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {middle}
      </div>
      <div className="flex items-center justify-end gap-2 overflow-hidden text-ellipsis whitespace-nowrap text-right">
        {right}
      </div>
    </div>
  );
};
