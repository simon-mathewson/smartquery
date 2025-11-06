import { Close } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { Button } from '~/shared/components/button/Button';
import { Footer } from '~/shared/components/footer/Footer';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { ConnectionsContext } from '../../connections/Context';
import { NavigationSidebarContext } from './Context';
import { SavedQueryList } from './savedQueryList/SavedQueryList';
import { TableList } from './tableList/TableList';
import { AnalyticsContext } from '~/content/analytics/Context';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Connections } from '~/content/connections/Connections';
import { routes } from '~/router/routes';
import { Logo } from '~/shared/components/logo/LogoIcon';

export const NavigationSidebar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { isOpen, setIsOpen } = useDefinedContext(NavigationSidebarContext);

  const isMobile = useIsMobile();

  const homeButtonRef = useRef<HTMLAnchorElement | null>(null);

  const connectionsOverlay = useOverlay({
    align: 'left',
    anchorRef: homeButtonRef,
    darkenBackground: true,
    onOpen: () => track('navigation_sidebar_open_connections'),
  });

  const sidebarRef = useRef<HTMLDivElement>(null);

  const [desktopWidth, setDesktopWidth] = useStoredState('NavigationSidebar.width', 236);

  return (
    <div
      className={classNames(
        'absolute -left-full top-0 z-50 flex h-[100dvh] flex-col items-start gap-1 bg-background px-2 pt-2 transition-[left] sm:sticky sm:left-0',
        {
          '!left-0': isOpen,
        },
      )}
      ref={sidebarRef}
      style={{ width: isMobile ? '100%' : `${desktopWidth}px` }}
    >
      {!isMobile && (
        <ResizeHandle
          offset={7}
          position="right"
          onResize={setDesktopWidth}
          minWidth={100}
          maxWidth={500}
        />
      )}
      <div className="flex w-full items-center">
        <Button
          element="link"
          htmlProps={{ href: routes.root(), ref: homeButtonRef }}
          icon={<Logo htmlProps={{ className: 'w-6 h-6' }} />}
        />
        <button
          {...connectionsOverlay.triggerProps}
          className="grid w-full cursor-pointer select-none gap-[2px] rounded-lg p-[6px] text-left text-sm hover:bg-secondaryHighlight"
        >
          {activeConnection && (
            <>
              <div className="truncate text-sm font-medium leading-tight text-textPrimary">
                {activeConnection.name}
              </div>
              <div className="truncate text-xs font-medium leading-tight text-textTertiary">
                {activeConnection.database}
                {activeConnection.engine === 'postgres' && ` ⁠– ${activeConnection.schema}`}
              </div>
            </>
          )}
        </button>
        <OverlayCard htmlProps={{ className: 'w-max p-2 shadow-2xl' }} overlay={connectionsOverlay}>
          {() => <Connections />}
        </OverlayCard>
        {isMobile && (
          <Button
            color="secondary"
            htmlProps={{ onClick: () => setIsOpen(false) }}
            icon={<Close />}
          />
        )}
      </div>
      {activeConnection && (
        <div className="flex w-full grow flex-col overflow-auto">
          <SavedQueryList />
          {<TableList />}
        </div>
      )}
      <Footer htmlProps={{ className: '-mx-1 px-1 shrink-0' }} />
    </div>
  );
};
