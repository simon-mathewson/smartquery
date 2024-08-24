import React from 'react';
import type { useConnections } from '../../useConnections';
import { ConnectionsContext } from '../../Context';
import { DatabaseList } from './List';
import type { DeepPartial } from 'ts-essentials';

export type DatabaseListStoryProps = {
  connectionsContext: DeepPartial<ReturnType<typeof useConnections>>;
};

export const DatabaseListStory: React.FC<DatabaseListStoryProps> = (props) => {
  const { connectionsContext } = props;

  return (
    <ConnectionsContext.Provider value={connectionsContext as ReturnType<typeof useConnections>}>
      <DatabaseList />
    </ConnectionsContext.Provider>
  );
};
