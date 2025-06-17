import React from 'react';
import type { useConnections } from '../useConnections';
import type { ConnectionFormProps } from './ConnectionForm';
import { ConnectionForm } from './ConnectionForm';
import type { DeepPartial } from 'ts-essentials';
import { TestApp } from '~/test/componentTests/TestApp';

export type ConnectionFormStoryProps = {
  connectionsContext: DeepPartial<ReturnType<typeof useConnections>>;
  connectionFormProps: ConnectionFormProps;
};

export const ConnectionFormStory: React.FC<ConnectionFormStoryProps> = (props) => {
  const { connectionsContext, connectionFormProps } = props;

  return (
    <TestApp mockOverrides={{ ConnectionsProvider: connectionsContext }}>
      <ConnectionForm {...connectionFormProps} />
    </TestApp>
  );
};
