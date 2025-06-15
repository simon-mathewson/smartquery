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

export type TestConnectionProps = {
  formValues: FormValues;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { formValues } = props;

  const { connectRemote, disconnectRemote } = useDefinedContext(ConnectionsContext);

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
    try {
      const isNewConnection = formValues.id === '';
      const connection = getConnectionFromForm({ ...formValues, id: formValues.id || 'id' });
      assert(connection.type === 'remote');

      setIsTesting(true);
      setHasFailed(false);
      setHasSucceeded(false);

      const clientId = await connectRemote(connection, { skipDecryption: isNewConnection });
      await disconnectRemote(clientId);
      setHasSucceeded(true);
    } catch (error) {
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
