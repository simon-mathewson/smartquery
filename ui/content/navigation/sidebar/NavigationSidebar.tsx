import classNames from 'classnames';
import React, { useRef } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Connections } from '~/content/connections/Connections';
import { NativeContext } from '~/content/native/Context';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Footer } from '~/shared/components/footer/Footer';
import { Logo } from '~/shared/components/logo/LogoIcon';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { ConnectionsContext } from '../../connections/Context';
import { SavedQueryList } from './savedQueryList/SavedQueryList';
import { TableList } from './tableList/TableList';

export const NavigationSidebar: React.FC = () => {
  const native = useDefinedContext(NativeContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);

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
    <div className="relative z-50 h-[100dvh] p-2 pr-0">
      {!isMobile && (
        <ResizeHandle
          offset={9}
          position="right"
          onResize={setDesktopWidth}
          minWidth={100}
          maxWidth={500}
        />
      )}
      <div
        className={classNames(
          'flex h-full flex-col items-start gap-1 rounded-2xl border border-border bg-card/60 px-2 pt-2 shadow-2xl backdrop-blur-xl',
          { 'pt-8': native.isElectron },
        )}
        ref={sidebarRef}
        style={{ width: isMobile ? '100%' : `${desktopWidth}px` }}
      >
        <div className="flex w-full items-center">
          <Button
            element="link"
            htmlProps={{ href: routes.root(), ref: homeButtonRef }}
            icon={<Logo htmlProps={{ className: 'w-6 h-6' }} />}
          />
          <button
            {...connectionsOverlay.triggerProps}
            className="grid w-full cursor-pointer select-none gap-[2px] rounded-xl p-[6px] text-left text-sm hover:bg-secondaryHighlight"
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
          <OverlayCard
            htmlProps={{ className: 'w-max p-2 shadow-2xl' }}
            overlay={connectionsOverlay}
          >
            {() => <Connections />}
          </OverlayCard>
        </div>
        {activeConnection && (
          <div className="flex w-full grow flex-col overflow-auto">
            <SavedQueryList />
            <TableList />
          </div>
        )}
        <Footer htmlProps={{ className: 'shrink-0' }} />
      </div>
    </div>
  );
};
