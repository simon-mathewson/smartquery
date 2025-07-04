import { CheckCircleOutline, SettingsEthernet, WarningAmber } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import React, { useEffect, useState } from 'react';
import type { FormValues } from '../utils';
import { getConnectionFromForm, isFormValid } from '../utils';
import type { SignInModalInput } from '~/content/connections/signInModal/types';
import { useModal } from '~/shared/components/modal/useModal';
import { SignInModal } from '~/content/connections/signInModal/SignInModal';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { assert } from 'ts-essentials';
import { ConnectionsContext } from '../../Context';
import { AnalyticsContext } from '~/content/analytics/Context';
import { ConnectCanceledError } from '../../connectAbortedError';

export type TestConnectionProps = {
  formValues: FormValues;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { formValues } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { connections, connectRemote, disconnectRemote } = useDefinedContext(ConnectionsContext);

  const [isTesting, setIsTesting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const signInModal = useModal<SignInModalInput>();

  useEffect(() => {
    setHasFailed(false);
    setHasSucceeded(false);
    setIsTesting(false);
  }, [formValues]);

  const test = async () => {
    const isNewConnection = formValues.id === '';
    const connection = getConnectionFromForm({ ...formValues, id: formValues.id || 'id' });
    assert(connection.type === 'remote');

    const existingConnection = connections.find((c) => c.id === connection.id);
    if (existingConnection) {
      assert(existingConnection.type === 'remote');
      assert(!isNewConnection);
    }

    const skipDecryptPassword = existingConnection
      ? existingConnection.password !== connection.password ||
        existingConnection.credentialStorage !== 'encrypted'
      : true;
    const skipDecryptSsh = (() => {
      if (!connection.ssh) {
        return true;
      }

      if (!existingConnection) {
        return true;
      }

      return (
        existingConnection.ssh?.password !== connection.ssh.password ||
        existingConnection.ssh?.privateKey !== connection.ssh.privateKey ||
        existingConnection.credentialStorage !== 'encrypted'
      );
    })();

    track('connection_form_test_connection', {
      is_new: isNewConnection,
      engine: connection.engine,
    });

    setIsTesting(true);
    setHasFailed(false);
    setHasSucceeded(false);

    try {
      const clientId = await connectRemote(connection, {
        skipDecryption: { password: skipDecryptPassword, ssh: skipDecryptSsh },
      });
      await disconnectRemote(clientId);
      setHasSucceeded(true);

      track('connection_form_test_connection_succeess', {
        is_new: isNewConnection,
        engine: connection.engine,
      });
    } catch (error) {
      if (error instanceof ConnectCanceledError) {
        return;
      }

      track('connection_form_test_connection_fail', {
        is_new: isNewConnection,
        engine: connection.engine,
      });

      setHasFailed(true);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <>
      <SignInModal {...signInModal} />
      <Button
        htmlProps={{
          disabled: isTesting || !isFormValid(formValues),
          onClick: test,
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
