import { CheckCircleOutline, SettingsEthernet, WarningAmber } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import React, { useEffect, useState } from 'react';
import type { FormValues } from '../utils';
import { getConnectionFromForm, isFormValid } from '../utils';
import type { ConnectInput } from '~/shared/types';
import type { SignInModalInput } from '~/content/connections/signInModal/types';
import { useModal } from '~/shared/components/modal/useModal';
import { ConnectionSignInModal } from '~/content/connections/signInModal/SignInModal';
import { isAuthError } from '~/shared/utils/prisma/prisma';
import { isNil } from 'lodash';
import { TrpcContext } from '~/content/trpc/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export type TestConnectionProps = {
  formValues: FormValues;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { formValues } = props;

  const trpc = useDefinedContext(TrpcContext);

  const [isTesting, setIsTesting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const signInModal = useModal<SignInModalInput>();

  useEffect(() => {
    setHasFailed(false);
    setHasSucceeded(false);
  }, [formValues]);

  const test = async (credentials?: {
    password?: string;
    sshPassword?: string;
    sshPrivateKey?: string;
  }) => {
    const connection = getConnectionFromForm(formValues);

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
        htmlProps={{
          disabled: isTesting || !isFormValid(formValues),
          onClick: () => test(),
        }}
        icon={<SettingsEthernet />}
        label="Test connection"
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
