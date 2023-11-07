import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { useRef } from 'react';
import { Connections } from './Connections/Connections';

export const TopBar: React.FC = () => {
  const { connections, selectedConnectionIndex } = useDefinedContext(GlobalContext);

  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  const selectedConnection =
    selectedConnectionIndex !== null ? connections[selectedConnectionIndex] : null;

  return (
    <div
      className="relative flex h-12 w-full items-center justify-center px-2 py-2"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div
        className="border-1 grid w-max cursor-pointer rounded-lg border-gray-200 px-2 py-0.5 text-sm text-black hover:bg-gray-300"
        ref={connectionsTriggerRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ WebkitAppRegion: 'no-drag' } as any}
      >
        {selectedConnection ? (
          <>
            <div className="text-center font-medium leading-snug">{selectedConnection.name}</div>
            <div className="text-center text-xs text-gray-500">
              {selectedConnection.host}:{selectedConnection.port}
            </div>
          </>
        ) : (
          <div>Select connection</div>
        )}
      </div>

      <Connections triggerRef={connectionsTriggerRef} />
    </div>
  );
};
