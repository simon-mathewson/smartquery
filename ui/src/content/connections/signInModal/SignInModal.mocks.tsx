import { spy } from 'tinyspy';
import { getModalControlMock } from '~/shared/components/modal/ModalControl.mock';
import { getContextMock } from '../mocks';
import type { SignInModalProps } from './SignInModal';
import type { SignInModalStoryProps } from './SignInModal.story';

export const getSignInModalProps = () =>
  ({
    ...getModalControlMock(),
    input: {
      connection: getContextMock().connections[0],
      onSignIn: spy(),
    },
  }) satisfies SignInModalProps;

export const getSignInModalStoryProps = () =>
  ({
    connectionsContext: getContextMock(),
    signInModalProps: getSignInModalProps(),
  }) satisfies SignInModalStoryProps;
