import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { TestConnection, type TestConnectionProps } from './TestConnection';

export type TestConnectionStoryProps = StoryProps<TestConnectionProps> & {
  shouldFail: boolean;
};

export const TestConnectionStory = ({
  componentProps,
  shouldFail,
  testApp,
}: TestConnectionStoryProps) => (
  <TestApp
    providerOverrides={{
      ConnectionsProvider: {
        activeConnection: null,
        connectRemote: (input) =>
          new Promise((resolve, reject) => {
            void testApp?.providerOverrides?.ConnectionsProvider?.connectRemote?.(input);
            setTimeout(() => {
              if (shouldFail) {
                reject(new Error('Failed to connect'));
              } else {
                resolve({
                  connectedViaCloud: false,
                  connectorId: '1',
                });
              }
            }, 400);
          }),
        disconnectRemote: (input) =>
          new Promise((resolve) => {
            void testApp?.providerOverrides?.ConnectionsProvider?.disconnectRemote?.(input);
            resolve();
          }),
      },
    }}
  >
    <TestConnection {...componentProps} />
  </TestApp>
);
