import React from 'react';

export type HeaderProps = { left?: React.ReactNode; right?: React.ReactNode; title: string };

export const Header: React.FC<HeaderProps> = (props) => {
  const { left, right, title } = props;

  return (
    <div className="mb-2 grid h-[36px] w-full grid-cols-[36px_1fr_36px] items-center gap-2">
      {left ?? <div />}
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-gray-600">
        {title}
      </div>
      {right ?? <div />}
    </div>
  );
};
