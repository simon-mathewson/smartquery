import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import type { SignInModalProps } from './SignInModal';
import { SignInModal } from './SignInModal';

export type SignInModalStoryProps = StoryProps<SignInModalProps> & {
  showError?: boolean;
};

export const SignInModalStory: React.FC<SignInModalStoryProps> = ({
  componentProps,
  showError,
  testApp,
}) => (
  <TestApp {...testApp}>
    <SignInModal
      {...componentProps}
      input={
        componentProps.input
          ? {
              ...componentProps.input,
              onSignIn: showError
                ? () => {
                    throw new Error('Authentication failed');
                  }
                : async (credentials) => {
                    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
                    void componentProps.input?.onSignIn(credentials);
                  },
            }
          : undefined
      }
    />
  </TestApp>
);
