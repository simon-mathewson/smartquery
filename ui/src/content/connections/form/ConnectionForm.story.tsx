import React from 'react';
import type { useConnections } from '../useConnections';
import { ConnectionsContext } from '../Context';
import type { ConnectionFormProps } from './ConnectionForm';
import { ConnectionForm } from './ConnectionForm';
import type { DeepPartial } from 'ts-essentials';
import type { LinkApiClient } from '~/content/link/api/client';
import { LinkApiContext } from '~/content/link/api/Context';

export type ConnectionFormStoryProps = {
  connectionsContext: DeepPartial<ReturnType<typeof useConnections>>;
  connectionFormProps: ConnectionFormProps;
};

export const ConnectionFormStory: React.FC<ConnectionFormStoryProps> = (props) => {
  const { connectionsContext, connectionFormProps } = props;

  return (
    <ConnectionsContext.Provider value={connectionsContext as ReturnType<typeof useConnections>}>
      <LinkApiContext.Provider value={{} as Partial<LinkApiClient> as LinkApiClient}>
        <ConnectionForm {...connectionFormProps} />
      </LinkApiContext.Provider>
    </ConnectionsContext.Provider>
  );
};
