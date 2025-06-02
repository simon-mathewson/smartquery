import React from 'react';
import { Logo } from '../logo/Logo';

export const Page: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <div className="mx-auto flex w-[356px] flex-col items-center gap-6 pb-16 pt-8">
      <Logo htmlProps={{ className: 'w-16' }} />
      {children}
    </div>
  );
};
