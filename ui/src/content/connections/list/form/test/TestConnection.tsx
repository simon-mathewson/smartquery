import { CheckCircleOutline, SettingsEthernet, WarningAmber } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';
import React, { useEffect, useState } from 'react';
import type { FormSchema } from '../utils';
import { getConnectionFromForm, isFormValid } from '../utils';
import { trpc } from '~/trpc';
import type { ConnectInput } from '~/shared/types';
import type { SignInModalInput } from '~/content/connections/signInModal/types';
import { useModal } from '~/shared/components/modal/useModal';
import { ConnectionSignInModal } from '~/content/connections/signInModal/SignInModal';
import { isAuthError } from '~/shared/utils/prisma';
import { isNil } from 'lodash';

export type TestConnectionProps = {
  form: FormSchema;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { form } = props;

  const [isTesting, setIsTesting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const signInModal = useModal<SignInModalInput>();

  useEffect(() => {
    setHasFailed(false);
    setHasSucceeded(false);
  }, [form]);

  const test = async (credentials?: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
  }) => {
    const connection = getConnectionFromForm(form);

    const password = credentials?.password ?? connection.password;
    const sshPassword = credentials?.sshPassword ?? connection.ssh?.password;
    const sshPrivateKey = credentials?.sshPrivateKey ?? connection.ssh?.privateKey;

    if (isNil(password) || (connection.ssh && isNil(sshPassword) && isNil(sshPrivateKey))) {
      signInModal.open({
        connection,
        onSignIn: test,
      });
      return;
    }

    setIsTesting(true);
    setHasFailed(false);
    setHasSucceeded(false);

    try {
      const clientId = await trpc.connectDb.mutate({
        ...connection,
        password,
        ssh: connection.ssh
          ? {
              ...connection.ssh,
              password: sshPassword,
              privateKey: sshPrivateKey,
            }
          : null,
      } as ConnectInput);
      setHasSucceeded(true);
      await trpc.disconnectDb.mutate(clientId);
    } catch (error) {
      // Throw auth error so sign in modal can show error message
      if (isAuthError(error)) {
        throw error;
      }
      setHasFailed(true);
    }

    setIsTesting(false);
  };

  return (
    <>
      <ConnectionSignInModal {...signInModal} />
      <Button
        className="mt-2"
        disabled={isTesting || !isFormValid(form)}
        icon={<SettingsEthernet />}
        label="Test connection"
        onClick={() => test()}
        {...(isTesting && {
          label: 'Testing connection...',
        })}
        {...(hasSucceeded && {
          color: 'success',
          icon: <CheckCircleOutline />,
          label: 'Connection succeeded',
        })}
        {...(hasFailed && {
          color: 'danger',
          icon: <WarningAmber />,
          label: 'Connection failed',
        })}
      />
    </>
  );
};
