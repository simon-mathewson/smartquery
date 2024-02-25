import { CheckCircleOutline, SettingsEthernet, WarningAmber } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';
import React, { useEffect, useState } from 'react';
import type { ConnectionSchema, FormSchema } from '../utils';
import { isFormValid } from '../utils';
import { trpc } from '~/trpc';

export type TestConnectionProps = {
  form: FormSchema;
};

export const TestConnection: React.FC<TestConnectionProps> = (props) => {
  const { form } = props;

  const [isTesting, setIsTesting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setHasFailed(false);
    setHasSucceeded(false);
  }, [form]);

  const test = async () => {
    setIsTesting(true);
    setHasFailed(false);
    setHasSucceeded(false);

    try {
      const clientId = await trpc.connectDb.mutate(form as ConnectionSchema);
      setHasSucceeded(true);
      await trpc.disconnectDb.mutate(clientId);
    } catch (error) {
      setHasFailed(true);
    }

    setIsTesting(false);
  };

  return (
    <Button
      disabled={isTesting || !isFormValid(form)}
      icon={<SettingsEthernet />}
      label="Test connection"
      onClick={test}
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
  );
};
