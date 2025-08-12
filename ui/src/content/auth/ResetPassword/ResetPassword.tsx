import { ArrowBack, Done } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { assert } from 'ts-essentials';
import { useLocation, useSearchParams } from 'wouter';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { ToastContext } from '~/content/toast/Context';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Card } from '~/shared/components/card/Card';
import { Header } from '~/shared/components/header/Header';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../Context';
import { PasswordFields } from '../PasswordFields';

export const ResetPassword: React.FC = () => {
  const [, navigate] = useLocation();
  const { cloudApi } = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);
  const auth = useDefinedContext(AuthContext);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  assert(token, 'Token is required');

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        await cloudApi.auth.resetPassword.mutate({
          password,
          token,
        });

        toast.add({
          color: 'success',
          title: 'Password reset successful',
        });

        await auth.logIn(auth.user!.email, password);

        navigate(routes.root());
      } catch (error) {
        toast.add({
          color: 'danger',
          description: error instanceof Error ? error.message : 'Unknown error',
          title: 'Failed to reset password',
        });
      }
    },
    [auth, cloudApi.auth.resetPassword, navigate, password, toast, token],
  );

  return (
    <Page title="Reset password">
      <Card htmlProps={{ className: 'w-full max-w-[356px]' }}>
        <Header
          left={<Button element="link" htmlProps={{ href: routes.login() }} icon={<ArrowBack />} />}
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              Reset password
            </div>
          }
        />
        <form className="flex flex-col gap-2 py-2" onSubmit={handleSubmit}>
          <PasswordFields
            password={password}
            repeatPassword={repeatPassword}
            setPassword={setPassword}
            setRepeatPassword={setRepeatPassword}
          />
          <Button
            htmlProps={{
              className: 'mt-2',
              disabled: repeatPassword !== password || !password,
              type: 'submit',
            }}
            icon={<Done />}
            label="Reset password"
            variant="filled"
          />
        </form>
      </Card>
    </Page>
  );
};
