import { LinkApiContext } from '~/content/link/api/Context';
import { TestConnection, type TestConnectionProps } from './TestConnection';
import type { LinkApiClient } from '~/content/link/api/client';
import { ConnectionsContext } from '../../Context';
import type { getMockLinkApiClient } from './TestConnection.mocks';
import { getConnectionsContextMock } from '../../mocks';

export type TestConnectionStoryProps = {
  mockLinkApiClient: ReturnType<typeof getMockLinkApiClient>;
  props: TestConnectionProps;
  shouldFail: boolean;
  shouldFailWithAuthError: boolean;
};

export const TestConnectionStory = (storyProps: TestConnectionStoryProps) => {
  const { mockLinkApiClient, props, shouldFail, shouldFailWithAuthError } = storyProps;

  return (
    <LinkApiContext.Provider
      value={
        {
          connectDb: {
            mutate: (input) =>
              new Promise((resolve, reject) => {
                mockLinkApiClient.connectDb.mutate(input);
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
                mockLinkApiClient.disconnectDb.mutate(input);
                resolve();
              }),
          },
        } as Partial<LinkApiClient> as LinkApiClient
      }
    >
      <ConnectionsContext.Provider
        value={{ ...getConnectionsContextMock(), activeConnection: null }}
      >
        <TestConnection {...props} />
      </ConnectionsContext.Provider>
    </LinkApiContext.Provider>
  );
};
