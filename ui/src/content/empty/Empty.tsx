import React, { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../connections/Context';
import { Connections } from '~/content/NavigationSidebar/Connections/Connections';

export const Empty: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const connectionsTriggerRef = useRef<HTMLDivElement | null>(null);

  if (activeConnection) return null;

  return (
    <>
      <div
        className="grid w-full cursor-pointer gap-1 rounded-lg p-2 text-sm hover:bg-secondaryHighlight"
        ref={connectionsTriggerRef}
      >
        <div>Select connection</div>
      </div>
      <Connections triggerRef={connectionsTriggerRef} />
    </>
  );
};
