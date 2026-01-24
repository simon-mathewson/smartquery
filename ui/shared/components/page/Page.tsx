import classNames from 'classnames';
import React from 'react';
import { Helmet } from 'react-helmet';
import { MobileNavigation } from '~/content/navigation/mobile/MobileNavigation';
import { useIsMobile } from '../../hooks/useIsMobile/useIsMobile';
import { Footer } from '../footer/Footer';

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
      <div className="relative flex min-h-[100dvh] flex-col">
        <div
          className={classNames(
            'mx-auto flex w-full flex-col items-center gap-6 px-2 pb-2 pt-2 sm:max-w-[400px] sm:gap-10 sm:px-4 sm:pb-4 sm:pt-8',
            htmlProps?.className,
          )}
        >
          {children}
        </div>
        {!isMobile && <Footer htmlProps={{ className: 'px-2 pt-2 !w-full sm:!w-[256px]' }} />}
        <MobileNavigation />
      </div>
    </>
  );
};
