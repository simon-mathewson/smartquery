import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TableList } from '../tableList/TableList';
import { ConnectionsContext } from '../connections/Context';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Connections } from '../connections/Connections';
import { AnalyticsContext } from '~/content/analytics/Context';
import { Button } from '~/shared/components/button/Button';
import { Logo } from '~/shared/components/logo/LogoIcon';
import { routes } from '~/router/routes';
import { useOverlay } from '~/shared/components/overlay/useOverlay';
import { ResizeHandle } from '~/shared/components/resizeHandle/ResizeHandle';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const NavigationSidebar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const connectionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const homeButtonRef = useRef<HTMLAnchorElement | null>(null);

  const connectionsOverlay = useOverlay({
    align: 'left',
    anchorRef: homeButtonRef,
    darkenBackground: true,
    triggerRef: connectionsTriggerRef,
  });

  const sidebarRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useStoredState('NavigationSidebar.width', 232);

  return (
    <div
      className="sticky top-0 flex h-[calc(100vh-90px)] grid-rows-[max-content_max-content_minmax(auto,max-content)] flex-col items-start gap-1 px-2 pt-2"
      ref={sidebarRef}
      style={{ width: `${width}px` }}
    >
      <ResizeHandle offset={7} position="right" onResize={setWidth} minWidth={100} maxWidth={500} />
      <div className="flex w-full items-center">
        <Button
          element="link"
          htmlProps={{ href: routes.root(), ref: homeButtonRef }}
          icon={<Logo htmlProps={{ className: 'w-6 h-6' }} />}
        />
        <button
          className="grid w-full cursor-pointer select-none gap-[2px] rounded-lg p-[6px] text-left text-sm hover:bg-secondaryHighlight"
          ref={connectionsTriggerRef}
          onClick={() => {
            track('navigation_sidebar_open_connections');
          }}
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
      </div>
      <OverlayCard htmlProps={{ className: 'w-max p-2 shadow-2xl' }} overlay={connectionsOverlay}>
        {() => <Connections />}
      </OverlayCard>
      {activeConnection && <TableList />}
    </div>
  );
};
