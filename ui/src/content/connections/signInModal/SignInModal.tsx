import { Key } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { assert } from 'ts-essentials';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { Modal } from '~/shared/components/modal/Modal';
import type { ModalControl } from '~/shared/components/modal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { isAuthError } from '~/shared/utils/prisma/prisma';
import { ConnectionsContext } from '../Context';
import { getCredentialUsername } from '../utils';
import type { SignInModalInput } from './types';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';

export type SignInModalProps = ModalControl<SignInModalInput>;

export const SignInModal: React.FC<SignInModalProps> = (props) => {
  const { close, input } = props;

  const [, navigate] = useLocation();

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
            connection.credentialStorage === 'alwaysAsk' && connection.ssh?.password !== undefined
              ? sshPassword
              : undefined,
          sshPrivateKey:
            connection.credentialStorage === 'alwaysAsk' && connection.ssh?.privateKey !== undefined
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
                <Input htmlProps={{ disabled: true, value: username }} />
              </Field>
              <Field label="Password">
                <CredentialInput
                  htmlProps={{ value: password }}
                  isExistingCredential
                  onChange={setPassword}
                  showAddToKeychain
                  username={username}
                />
              </Field>
              {/* Enable submit on enter despite actual submit button being outside form */}
              <button className="hidden" type="submit" />
            </fieldset>
          </form>
        )}
        {connection.credentialStorage === 'alwaysAsk' && connection.ssh && (
          <form onSubmit={onSubmit}>
            <fieldset className="flex flex-col gap-2" disabled={isConnecting}>
              <Field label="SSH User">
                <Input htmlProps={{ disabled: true, value: sshUsername }} />
              </Field>
              {connection.ssh.password !== undefined && (
                <Field label="SSH Password">
                  <CredentialInput
                    htmlProps={{ value: sshPassword }}
                    isExistingCredential
                    onChange={setSshPassword}
                    showAddToKeychain
                    username={sshUsername as string}
                  />
                </Field>
              )}
              {connection.ssh.privateKey !== undefined && (
                <Field label="SSH Private key">
                  <CredentialInput
                    htmlProps={{ value: sshPrivateKey }}
                    isExistingCredential
                    onChange={setSshPrivateKey}
                    showAddToKeychain
                    username={sshUsername as string}
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
            htmlProps={{
              disabled: isConnecting,
              onClick: () => {
                close();
                if (!activeConnection) {
                  navigate(routes.root());
                }
              },
            }}
            label="Cancel"
          />
          <Button
            htmlProps={{ disabled: isConnecting, onClick: () => onSubmit() }}
            label="Sign in"
            icon={<Key />}
            variant="filled"
          />
        </div>
      </div>
    </Modal>
  );
};
