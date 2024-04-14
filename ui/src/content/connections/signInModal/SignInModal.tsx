import { Key } from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { Field } from '~/shared/components/Field/Field';
import { Input } from '~/shared/components/Input/Input';
import { Modal } from '~/shared/components/modal/Modal';
import type { ModalControl } from '~/shared/components/modal/types';
import type { SignInModalInput } from './types';
import { assert } from 'ts-essentials';
import { getCredentialUsername } from '../utils';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { isAuthError } from '~/shared/utils/prisma';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';

export const ConnectionSignInModal: React.FC<ModalControl<SignInModalInput>> = (props) => {
  const { close, input } = props;

  const navigate = useNavigate();

  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAuthFailed, setShowAuthFailed] = useState(false);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      assert(input);
      const { onSignIn } = input;

      setIsConnecting(true);
      setShowAuthFailed(false);

      try {
        await onSignIn(password);
        setPassword('');
        close();
      } catch (error) {
        if (isAuthError(error)) {
          setShowAuthFailed(true);
        }
      } finally {
        setIsConnecting(false);
      }
    },
    [close, input, password],
  );

  if (!input) return null;

  const { connection } = input;

  return (
    <Modal {...props} className="w-[272px]" title="Sign in">
      <form onSubmit={onSubmit}>
        <fieldset disabled={isConnecting} className="flex flex-col gap-2">
          <div className="truncate px-1 pb-1 text-xs text-textTertiary">{connection.name}</div>
          <Field label="User">
            <Input autoComplete="username" disabled value={getCredentialUsername(connection)} />
          </Field>
          <Field label="Password">
            <Input
              autoComplete="current-password"
              autoFocus
              onChange={setPassword}
              type="password"
              value={password}
            />
          </Field>
          {showAuthFailed && <ErrorMessage>Authentication failed. Please try again.</ErrorMessage>}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button
              disabled={isConnecting}
              label="Cancel"
              onClick={() => {
                close();
                if (!activeConnection) {
                  navigate(routes.root());
                }
              }}
            />
            <Button
              disabled={isConnecting}
              label="Sign in"
              icon={<Key />}
              type="submit"
              variant="filled"
            />
          </div>
        </fieldset>
      </form>
    </Modal>
  );
};
