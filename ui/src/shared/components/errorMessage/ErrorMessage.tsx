import type { PropsWithChildren } from 'react';

export const ErrorMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="rounded-lg bg-dangerHighlight px-2 py-1 text-xs font-medium leading-normal text-danger">
      {children}
    </div>
  );
};
