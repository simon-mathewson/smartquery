import React from 'react';
import type { useConnections } from '../useConnections';
import { ConnectionsContext } from '../Context';
import type { SignInModalProps } from './SignInModal';
import { SignInModal } from './SignInModal';
import type { DeepPartial } from 'ts-essentials';
import { Router } from 'wouter';

export type SignInModalStoryProps = {
  connectionsContext: DeepPartial<ReturnType<typeof useConnections>>;
  navigate?: () => void;
  showError?: boolean;
  signInModalProps: SignInModalProps;
};

export const SignInModalStory: React.FC<SignInModalStoryProps> = (props) => {
  const { connectionsContext, navigate, showError, signInModalProps } = props;

  return (
    <Router hook={navigate ? () => ['', navigate] : undefined}>
      <ConnectionsContext.Provider value={connectionsContext as ReturnType<typeof useConnections>}>
        <SignInModal
          {...signInModalProps}
          input={
            signInModalProps.input
              ? {
                  ...signInModalProps.input,
                  onSignIn: showError
                    ? () => {
                        throw new Error('Authentication failed');
                      }
                    : async (credentials) => {
                        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
                        signInModalProps.input?.onSignIn(credentials);
                      },
                }
              : undefined
          }
        />
      </ConnectionsContext.Provider>
    </Router>
  );
};
