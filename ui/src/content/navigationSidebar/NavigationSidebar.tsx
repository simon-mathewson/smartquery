import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TableList } from '../tableList/TableList';
import { ConnectionsContext } from '../connections/Context';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Connections } from '../connections/Connections';
import { AnalyticsContext } from '~/content/analytics/Context';

export const NavigationSidebar: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const connectionsTriggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="sticky top-0 flex h-[calc(100vh-90px)] grid-rows-[max-content_max-content_minmax(auto,max-content)] flex-col items-start gap-2 px-2 pt-2">
      <button
        className="grid w-full cursor-pointer select-none gap-1 rounded-lg p-2 text-left text-sm hover:bg-secondaryHighlight"
        ref={connectionsTriggerRef}
        onClick={() => {
          track('navigation_sidebar_open_connections');
        }}
      >
        {activeConnection && (
          <>
            <div className="text-md truncate font-medium leading-tight text-textPrimary">
              {activeConnection.name}
            </div>
            {activeConnection.type === 'remote' && (
              <div className="truncate text-xs leading-tight text-textSecondary">
                {activeConnection.user}@{activeConnection.host}:{activeConnection.port}
              </div>
            )}
            <div className="truncate font-mono text-xs font-medium leading-tight text-textSecondary">
              {activeConnection.database}
            </div>
          </>
        )}
      </button>

      <OverlayCard
        align="left"
        htmlProps={{ className: 'w-max p-2 shadow-2xl' }}
        triggerRef={connectionsTriggerRef}
      >
        {() => <Connections />}
      </OverlayCard>

      {activeConnection && <TableList />}
    </div>
  );
};
