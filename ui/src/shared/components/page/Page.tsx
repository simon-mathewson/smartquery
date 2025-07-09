import React from 'react';
import { Logo } from '../logo/Logo';
import { Helmet } from 'react-helmet';

export type PageProps = React.PropsWithChildren<{
  title: string;
}>;

export const Page: React.FC<PageProps> = (props) => {
  const { children, title } = props;

  return (
    <>
      <Helmet>
        <title>{title} – Dabase</title>
      </Helmet>
      <div className="mx-auto flex w-[356px] flex-col items-center gap-6 pb-16 pt-8">
        <Logo htmlProps={{ className: 'w-16' }} />
        {children}
      </div>
    </>
  );
};
