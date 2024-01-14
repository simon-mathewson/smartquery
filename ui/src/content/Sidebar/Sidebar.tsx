import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TableList } from '../TableList/TableList';
import { Connections } from './Connections/Connections';
import { ConnectionsContext } from '../connections/Context';

export const Sidebar: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="sticky top-0 grid h-screen grid-rows-[max-content_max-content_minmax(auto,max-content)] gap-2 border-r border-r-gray-200 bg-gray-50/80 px-2 pt-2 backdrop-blur-lg">
      <div
        className="border-1 grid w-full cursor-pointer gap-1 rounded-lg border-gray-300 p-2 text-sm text-black hover:bg-gray-300"
        ref={connectionsTriggerRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {activeConnection ? (
          <>
            <div className="text-md truncate font-medium leading-tight">
              {activeConnection.name}
            </div>
            <div className="truncate text-xs leading-tight text-gray-500">
              {activeConnection.user}@{activeConnection.host}:{activeConnection.port}
            </div>
            <div className="truncate font-mono text-xs font-medium leading-tight text-gray-500">
              {activeConnection.database}
            </div>
          </>
        ) : (
          <div>Select connection</div>
        )}
      </div>
      <Connections triggerRef={connectionsTriggerRef} />
      <TableList />
    </div>
  );
};
