import React from 'react';
import { Logo } from '../logo/Logo';
import { Helmet } from 'react-helmet';
import classNames from 'classnames';
import { Link } from 'wouter';
import { routes } from '~/router/routes';
import { Footer } from '../footer/Footer';
import { useIsMobile } from '../../hooks/useIsMobile/useIsMobile';
import { MobileNavigation } from '~/content/navigation/mobile/MobileNavigation';

export type PageProps = React.PropsWithChildren<{
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  title: string;
}>;

export const Page: React.FC<PageProps> = (props) => {
  const { children, htmlProps, title } = props;

  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>{title} – SmartQuery</title>
      </Helmet>
      <div className="min-h-dvh relative flex flex-col">
        <div
          className={classNames(
            'mx-auto flex w-full max-w-[356px] flex-col items-center gap-6 pb-4 pt-8',
            htmlProps?.className,
          )}
        >
          <Link href={routes.root()}>
            <Logo htmlProps={{ className: 'w-56' }} />
          </Link>
          {children}
        </div>
        {!isMobile && <Footer htmlProps={{ className: 'px-2 pt-2 !w-full sm:!w-[236px]' }} />}
        <MobileNavigation />
      </div>
    </>
  );
};
