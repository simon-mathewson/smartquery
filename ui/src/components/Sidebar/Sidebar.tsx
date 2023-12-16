import React, { useRef } from 'react';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { GlobalContext } from '~/contexts/GlobalContext';
import { TableList } from '../TableList/TableList';
import { Connections } from './Connections/Connections';
import { Button } from '../shared/Button/Button';
import { Add } from '@mui/icons-material';
import { uniqueId } from 'lodash';

export const Sidebar: React.FC = () => {
  const { connections, selectedConnectionIndex, selectedDatabase, setQueries } =
    useDefinedContext(GlobalContext);

  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  const selectedConnection =
    selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

  return (
    <div className="absolute left-0 top-0 z-10 grid h-screen w-[224px] grid-rows-[max-content_max-content_minmax(auto,max-content)] gap-2 bg-gray-50/80 px-2 pt-2 backdrop-blur-lg">
      <div
        className="border-1 grid w-full cursor-pointer gap-2 rounded-lg border-gray-300 p-2 text-sm text-black hover:bg-gray-300"
        ref={connectionsTriggerRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {selectedConnection ? (
          <>
            <div className="text-md truncate font-medium leading-none">
              {selectedConnection.name}
            </div>
            <div className="truncate text-xs leading-none text-gray-500">
              {selectedConnection.user}@{selectedConnection.host}:{selectedConnection.port}
            </div>
            <div className="truncate font-mono text-xs font-medium leading-none text-gray-500">
              {selectedDatabase}
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
        onClick={() =>
          setQueries([
            [
              {
                id: uniqueId(),
                label: 'New Query',
                showEditor: true,
              },
            ],
          ])
        }
        variant="primary"
      />
      <TableList />
    </div>
  );
};
