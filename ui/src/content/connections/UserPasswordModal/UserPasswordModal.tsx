import { Key } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { assert } from 'ts-essentials';
import { AuthContext } from '~/content/auth/Context';
import { isUserUnauthorizedError } from '~/content/auth/isUserUnauthorizedError';
import { Button } from '~/shared/components/button/Button';
import { CredentialInput } from '~/shared/components/credentialInput/CredentialInput';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { Modal } from '~/shared/components/modal/Modal';
import type { ModalControl } from '~/shared/components/modal/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { UserPasswordModalInput } from './types';

export type UserPasswordModalProps = ModalControl<UserPasswordModalInput>;

export const UserPasswordModal: React.FC<UserPasswordModalProps> = (props) => {
  const { close, input, isOpen } = props;

  const { user } = useDefinedContext(AuthContext);

  const [password, setPassword] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthFailed, setShowAuthFailed] = useState(false);

  const onSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      event?.stopPropagation();

      assert(input);

      setIsProcessing(true);
      setShowAuthFailed(false);

      try {
        await input.onSubmit(password);

        close();
      } catch (error) {
        if (isUserUnauthorizedError(error)) {
          setShowAuthFailed(true);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [close, input, password],
  );

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  if (!input) {
    return null;
  }

  assert(user);

  return (
    <Modal
      {...props}
      htmlProps={{ className: 'w-[320px]' }}
      subtitle="Enter main password"
      title={input.mode === 'encrypt' ? 'Encrypt credentials' : 'Decrypt credentials'}
    >
      <div className="flex flex-col gap-4">
        <form onSubmit={onSubmit}>
          <fieldset disabled={isProcessing} className="flex flex-col gap-2">
            <Field label="User">
              <Input htmlProps={{ disabled: true, value: user.email }} />
            </Field>
            <Field label="Password">
              <CredentialInput
                htmlProps={{ value: password }}
                isExistingCredential
                onChange={setPassword}
                showAddToKeychain
                username={user.email}
              />
            </Field>
            {showAuthFailed && (
              <ErrorMessage>Authentication failed. Please try again.</ErrorMessage>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                htmlProps={{
                  disabled: isProcessing,
                  onClick: close,
                }}
                label="Cancel"
              />
              <Button
                htmlProps={{
                  disabled: isProcessing,
                  type: 'submit',
                }}
                label="Sign in"
                icon={<Key />}
                variant="filled"
              />
            </div>
          </fieldset>
        </form>
      </div>
    </Modal>
  );
};
