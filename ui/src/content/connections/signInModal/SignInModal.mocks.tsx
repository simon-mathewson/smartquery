import { spy } from 'tinyspy';
import { getModalControlMock } from '~/shared/components/modal/ModalControl.mock';
import { getConnectionsMock } from '../mocks';
import type { SignInModalProps } from './SignInModal';

export const getSignInModalProps = () =>
  ({
    ...getModalControlMock(),
    input: {
      connection: getConnectionsMock().connections[0],
      onSignIn: spy(),
    },
  }) satisfies SignInModalProps;
