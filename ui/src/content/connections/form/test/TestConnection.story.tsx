import { TrpcContext } from '~/content/trpc/Context';
import { TestConnection, type TestConnectionProps } from './TestConnection';
import type { TrpcClient } from '~/content/trpc/client';
import { ConnectionsContext } from '../../Context';
import type { getMockTrpcClient } from './TestConnection.mocks';
import { connectionsContextMock } from '../../Context.mock';

export type TestConnectionStoryProps = {
  mockTrpcClient: ReturnType<typeof getMockTrpcClient>;
  props: TestConnectionProps;
  shouldFail: boolean;
  shouldFailWithAuthError: boolean;
};

export const TestConnectionStory = (storyProps: TestConnectionStoryProps) => {
  const { mockTrpcClient, props, shouldFail, shouldFailWithAuthError } = storyProps;

  return (
    <TrpcContext.Provider
      value={
        {
          connectDb: {
            mutate: (input) =>
              new Promise((resolve, reject) => {
                mockTrpcClient.connectDb.mutate(input);
                setTimeout(() => {
                  if (shouldFail) {
                    reject(new Error('Failed to connect'));
                  } else if (shouldFailWithAuthError) {
                    reject(new Error('Authentication failed'));
                  } else {
                    resolve('1');
                  }
                }, 400);
              }),
          },
          disconnectDb: {
            mutate: (input) =>
              new Promise((resolve) => {
                mockTrpcClient.disconnectDb.mutate(input);
                resolve();
              }),
          },
        } as Partial<TrpcClient> as TrpcClient
      }
    >
      <ConnectionsContext.Provider value={{ ...connectionsContextMock, activeConnection: null }}>
        <TestConnection {...props} />
      </ConnectionsContext.Provider>
    </TrpcContext.Provider>
  );
};
