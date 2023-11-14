import React, { useRef } from 'react';
import { Button } from '../shared/Button/Button';
import { Add } from '@mui/icons-material';
import { uniqueId } from 'lodash';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { TableList } from '../TableList/TableList';
import { Connections } from './Connections/Connections';

export const Sidebar: React.FC = () => {
  const { connections, selectedConnectionIndex, setQueries } = useDefinedContext(GlobalContext);

  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  const selectedConnection =
    selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

  return (
    <div className="sticky left-0 top-0 z-10 grid h-screen w-[256px] grid-rows-[max-content_max-content_minmax(auto,max-content)] gap-4 bg-gray-50/90 px-4 pt-11 shadow-xl backdrop-blur-lg">
      <div
        className="border-1 grid w-full cursor-pointer rounded-lg border-gray-200 px-2 py-0.5 text-sm text-black hover:bg-gray-300"
        ref={connectionsTriggerRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {selectedConnection ? (
          <>
            <div className="font-medium leading-snug">{selectedConnection.name}</div>
            <div className="text-xs text-gray-500">
              {selectedConnection.user}@{selectedConnection.host}:{selectedConnection.port}
            </div>
          </>
        ) : (
          <div>Select connection</div>
        )}
      </div>
      <Connections triggerRef={connectionsTriggerRef} />
      <Button
        align="left"
        icon={<Add />}
        label="Query"
        onClick={() => setQueries([[{ id: uniqueId(), showEditor: true }]])}
        variant="primary"
      />
      <TableList />
    </div>
  );
};
