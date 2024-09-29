import React from 'react';
import type { useConnections } from '../useConnections';
import { ConnectionsContext } from '../Context';
import type { ConnectionFormProps } from './ConnectionForm';
import { ConnectionForm } from './ConnectionForm';
import type { DeepPartial } from 'ts-essentials';
import type { TrpcClient } from '~/content/trpc/client';
import { TrpcContext } from '~/content/trpc/Context';

export type ConnectionFormStoryProps = {
  connectionsContext: DeepPartial<ReturnType<typeof useConnections>>;
  connectionFormProps: ConnectionFormProps;
};

export const ConnectionFormStory: React.FC<ConnectionFormStoryProps> = (props) => {
  const { connectionsContext, connectionFormProps } = props;

  return (
    <ConnectionsContext.Provider value={connectionsContext as ReturnType<typeof useConnections>}>
      <TrpcContext.Provider value={{} as Partial<TrpcClient> as TrpcClient}>
        <ConnectionForm {...connectionFormProps} />
      </TrpcContext.Provider>
    </ConnectionsContext.Provider>
  );
};
