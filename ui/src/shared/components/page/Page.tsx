import React from 'react';
import { Logo } from '../logo/Logo';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { Link } from 'wouter';
import { routes } from '~/router/routes';
import { Footer } from '../footer/Footer';

export type PageProps = React.PropsWithChildren<{
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  title: string;
}>;

export const Page: React.FC<PageProps> = (props) => {
  const { children, htmlProps, title } = props;

  return (
    <>
      <Helmet>
        <title>{title} – SmartQuery</title>
      </Helmet>
      <div className="relative flex min-h-screen flex-col">
        <div
          className={classNames(
            'mx-auto flex w-full max-w-[356px] flex-col items-center gap-6 pb-16 pt-8',
            htmlProps?.className,
          )}
        >
          <Link href={routes.root()}>
            <Logo htmlProps={{ className: 'w-56' }} />
          </Link>
          {children}
        </div>
        <Footer htmlProps={{ className: 'px-2 w-[236px]' }} />
      </div>
    </>
  );
};
