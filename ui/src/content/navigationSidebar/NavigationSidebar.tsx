import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TableList } from '../tableList/TableList';
import { ConnectionsContext } from '../connections/Context';
import type { ActiveConnection } from '~/shared/types';
import { usePrevious } from '~/shared/hooks/usePrevious/usePrevious';
import { SettingsOverlay } from '../settings/Overlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Connections } from '../connections/Connections';

export const NavigationSidebar: React.FC = () => {
  const { activeConnection: currentActiveConnection } = useDefinedContext(ConnectionsContext);

  const connectionsTriggerRef = useRef<HTMLButtonElement | null>(null);

  const previousActiveConnection = usePrevious<ActiveConnection | null>(currentActiveConnection);

  const activeConnection = currentActiveConnection ?? previousActiveConnection;

  return (
    <div className="sticky top-0 flex h-screen grid-rows-[max-content_max-content_minmax(auto,max-content)] flex-col items-start gap-2 px-2 pt-2">
      <button
        className="grid w-full cursor-pointer select-none gap-1 rounded-lg p-2 text-left text-sm hover:bg-secondaryHighlight"
        ref={connectionsTriggerRef}
      >
        {activeConnection && (
          <>
            <div className="text-md truncate font-medium leading-tight text-textPrimary">
              {activeConnection.name}
            </div>
            <div className="truncate text-xs leading-tight text-textSecondary">
              {activeConnection.user}@{activeConnection.host}:{activeConnection.port}
            </div>
            <div className="truncate font-mono text-xs font-medium leading-tight text-textSecondary">
              {activeConnection.database}
            </div>
          </>
        )}
      </button>

      <OverlayCard
        align="left"
        htmlProps={{ className: 'w-max p-2 shadow-2xl w-[440px]' }}
        triggerRef={connectionsTriggerRef}
      >
        {() => <Connections />}
      </OverlayCard>

      {currentActiveConnection && <TableList />}

      <SettingsOverlay />
    </div>
  );
};
