import React from 'react';

export type ThreeColumnsProps = {
  left?: React.ReactNode;
  middle?: React.ReactNode;
  right?: React.ReactNode;
};

export const ThreeColumns: React.FC<ThreeColumnsProps> = (props) => {
  const { left, middle, right } = props;

  return (
    <div className="grid h-9 shrink-0 grid-cols-[1fr,1fr,1fr] gap-2">
      <div className="flex items-center justify-start gap-2">{left}</div>
      <div className="flex items-center justify-center gap-2">{middle}</div>
      <div className="flex items-center justify-end gap-2">{right}</div>
    </div>
  );
};
