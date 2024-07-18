import { Key } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assert } from 'ts-essentials';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { Modal } from '~/shared/components/modal/Modal';
import type { ModalControl } from '~/shared/components/modal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { isAuthError } from '~/shared/utils/prisma';
import { ConnectionsContext } from '../Context';
import { getCredentialUsername } from '../utils';
import type { SignInModalInput } from './types';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';

export const ConnectionSignInModal: React.FC<ModalControl<SignInModalInput>> = (props) => {
  const { close, input } = props;

  const navigate = useNavigate();

  const { activeConnection } = useDefinedContext(ConnectionsContext);

  const [password, setPassword] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  const [sshPrivateKey, setSshPrivateKey] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);
  const [showAuthFailed, setShowAuthFailed] = useState(false);

  const onSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      event?.stopPropagation();

      assert(input);
      const { connection, onSignIn } = input;

      setIsConnecting(true);
      setShowAuthFailed(false);

      try {
        await onSignIn({
          password: connection.credentialStorage === 'alwaysAsk' ? password : undefined,
          sshPassword:
            connection.ssh?.credentialStorage === 'alwaysAsk' &&
            connection.ssh?.password !== undefined
              ? sshPassword
              : undefined,
          sshPrivateKey:
            connection.ssh?.credentialStorage === 'alwaysAsk' &&
            connection.ssh?.privateKey !== undefined
              ? sshPrivateKey
              : undefined,
        });

        close();
      } catch (error) {
        if (isAuthError(error)) {
          setShowAuthFailed(true);
        }
      } finally {
        setIsConnecting(false);
      }
    },
    [close, input, password, sshPassword, sshPrivateKey],
  );

  useEffect(() => {
    if (!props.isOpen) {
      setPassword('');
      setSshPassword('');
      setSshPrivateKey('');
    }
  }, [props.isOpen]);

  if (!input) return null;

  const { connection } = input;

  const username = getCredentialUsername(connection);
  const sshUsername = connection.ssh ? getCredentialUsername(connection.ssh) : undefined;

  const showDbLogin = connection.credentialStorage === 'alwaysAsk';

  return (
    <Modal
      {...props}
      htmlProps={{ className: 'w-[320px]' }}
      subtitle={connection.name}
      title="Sign in"
    >
      <div className="flex flex-col gap-4">
        {showDbLogin && (
          <form onSubmit={onSubmit}>
            <fieldset disabled={isConnecting} className="flex flex-col gap-2">
              <Field label="User">
                <Input disabled value={username} />
              </Field>
              <Field label="Password">
                <CredentialInput
                  autoFocus
                  isExistingCredential
                  onChange={setPassword}
                  showAddToKeychain
                  username={username}
                  value={password}
                />
              </Field>
              {/* Enable submit on enter despite actual submit button being outside form */}
              <button className="hidden" type="submit" />
            </fieldset>
          </form>
        )}
        {connection.ssh?.credentialStorage === 'alwaysAsk' && (
          <form onSubmit={onSubmit}>
            <fieldset className="flex flex-col gap-2" disabled={isConnecting}>
              <Field label="SSH User">
                <Input disabled value={sshUsername} />
              </Field>
              {connection.ssh.password !== undefined && (
                <Field label="SSH Password">
                  <CredentialInput
                    autoFocus={!showDbLogin}
                    isExistingCredential
                    onChange={setPassword}
                    showAddToKeychain
                    username={sshUsername as string}
                    value={sshPassword}
                  />
                </Field>
              )}
              {connection.ssh.privateKey !== undefined && (
                <Field label="SSH Private key">
                  <CredentialInput
                    autoFocus={!showDbLogin}
                    isExistingCredential
                    onChange={setSshPrivateKey}
                    showAddToKeychain
                    username={sshUsername as string}
                    value={sshPrivateKey}
                  />
                </Field>
              )}
              {/* Enable submit on enter despite actual submit button being outside form */}
              <button className="hidden" type="submit" />
            </fieldset>
          </form>
        )}
        {showAuthFailed && <ErrorMessage>Authentication failed. Please try again.</ErrorMessage>}
        <div className="grid grid-cols-2 gap-2">
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
            onClick={() => onSubmit()}
            variant="filled"
          />
        </div>
      </div>
    </Modal>
  );
};
