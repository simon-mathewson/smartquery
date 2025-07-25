import { ArrowBack, ArrowForwardOutlined } from '@mui/icons-material';
import React, { useCallback, useState } from 'react';
import { useLocation, useSearchParams } from 'wouter';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { ToastContext } from '~/content/toast/Context';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import type { CaptchaModalInput } from '~/shared/components/captcha/Modal';
import { CaptchaModal } from '~/shared/components/captcha/Modal';
import { Card } from '~/shared/components/card/Card';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { Input } from '~/shared/components/input/Input';
import { useModal } from '~/shared/components/modal/useModal';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export const RequestResetPassword: React.FC = () => {
  const [, navigate] = useLocation();

  const { cloudApi } = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);

  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');

  const captchaModal = useModal<CaptchaModalInput>();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      captchaModal.open({
        onSuccess: async () => {
          try {
            await cloudApi.auth.requestResetPassword.mutate(email);

            toast.add({
              color: 'success',
              description:
                'If this email is associated with an account, you will receive a password reset email shortly.',
              title: 'Password reset email sent',
            });

            navigate(routes.root());
          } catch (error) {
            toast.add({
              color: 'danger',
              description: error instanceof Error ? error.message : 'Unknown error',
              title: 'Failed to send password reset email',
            });
          }
        },
      });
    },
    [captchaModal, cloudApi.auth.requestResetPassword, email, navigate, toast],
  );

  return (
    <>
      <CaptchaModal modalControl={captchaModal} />
      <Page title="Reset password">
        <Card htmlProps={{ className: 'w-full' }}>
          <Header
            left={
              <Button element="link" htmlProps={{ href: routes.login() }} icon={<ArrowBack />} />
            }
            middle={
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
                Reset password
              </div>
            }
          />
          <form className="flex flex-col gap-2 py-2" onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                htmlProps={{ autoFocus: true, type: 'email', value: email }}
                onChange={setEmail}
              />
            </Field>
            <Button
              htmlProps={{
                className: 'mt-2',
                disabled: !email,
                type: 'submit',
              }}
              icon={<ArrowForwardOutlined />}
              label="Request password reset"
              variant="filled"
            />
          </form>
        </Card>
      </Page>
    </>
  );
};
