import { spy } from 'tinyspy';
import { getModalControlMock } from '~/shared/components/modal/ModalControl.mock';
import { getConnectionsContextMock } from '../Context.mock';
import type { SignInModalProps } from './SignInModal';
import type { SignInModalStoryProps } from './SignInModal.story';

export const getSignInModalProps = () =>
  ({
    ...getModalControlMock(),
    input: {
      connection: getConnectionsContextMock().connections[0],
      onSignIn: spy(),
    },
  }) satisfies SignInModalProps;

export const getSignInModalStoryProps = () =>
  ({
    connectionsContext: getConnectionsContextMock(),
    signInModalProps: getSignInModalProps(),
  }) satisfies SignInModalStoryProps;
