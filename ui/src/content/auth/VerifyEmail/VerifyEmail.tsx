import { TRPCClientError } from '@trpc/client';
import React from 'react';
import { assert } from 'ts-essentials';
import { useLocation, useSearchParams } from 'wouter';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { ToastContext } from '~/content/toast/Context';
import { routes } from '~/router/routes';
import { Loading } from '~/shared/components/loading/Loading';
import { Page } from '~/shared/components/page/Page';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const VerifyEmail: React.FC = () => {
  const [, navigate] = useLocation();
  const cloudApi = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  assert(token, 'Token is required');

  useEffectOnce(() => {
    void cloudApi.auth.verifyEmail
      .mutate(token)
      .then(() => {
        toast.add({
          color: 'success',
          title: 'Email successfully verified',
        });
      })
      .catch((error) => {
        if (error instanceof TRPCClientError) {
          toast.add({
            color: 'danger',
            title: 'Failed to verify email',
            description: error.message,
          });
        } else {
          throw error;
        }
      })
      .finally(() => {
        navigate(routes.root());
      });
  });

  return (
    <Page title="Verify Email">
      <Loading size="large" />
    </Page>
  );
};
