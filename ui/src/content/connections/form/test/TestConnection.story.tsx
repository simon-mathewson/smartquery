import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { TestConnection, type TestConnectionProps } from './TestConnection';

export type TestConnectionStoryProps = StoryProps<TestConnectionProps> & {
  shouldFail: boolean;
};

export const TestConnectionStory = ({ props, providers, shouldFail }: TestConnectionStoryProps) => (
  <TestApp
    providerOverrides={{
      ConnectionsProvider: {
        activeConnection: null,
        connectRemote: (input) =>
          new Promise((resolve, reject) => {
            providers?.ConnectionsProvider?.connectRemote?.(input);
            setTimeout(() => {
              if (shouldFail) {
                reject(new Error('Failed to connect'));
              } else {
                resolve('1');
              }
            }, 400);
          }),
        disconnectRemote: (input) =>
          new Promise((resolve) => {
            providers?.ConnectionsProvider?.disconnectRemote?.(input);
            resolve();
          }),
      },
    }}
  >
    <TestConnection {...props} />
  </TestApp>
);
