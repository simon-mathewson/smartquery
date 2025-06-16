import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import type { User } from './types';
import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ToastContext } from '../toast/Context';
import { routes } from '~/router/routes';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { isUserUnauthorizedError } from './isUserUnauthorizedError';

export const useAuth = () => {
  const [, navigate] = useLocation();

  const cloudApi = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);

  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const logOut = useCallback(
    async (props: { silent?: boolean } = {}) => {
      setUser(null);

      await cloudApi.auth.logOut.mutate();

      if (!props.silent) {
        toast.add({
          title: 'Successfully logged out',
          color: 'success',
        });

        navigate(routes.root());
      }
    },
    [cloudApi, navigate, setUser, toast],
  );

  const getCurrentUser = useCallback(async () => {
    try {
      const user = await cloudApi.auth.currentUser.query();

      setUser(user);
    } catch (error) {
      if (isUserUnauthorizedError(error)) {
        await logOut({ silent: true });
        return;
      }
      throw error;
    } finally {
      setIsInitializing(false);
    }
  }, [cloudApi.auth.currentUser, logOut, setUser]);

  const logIn = useCallback(
    async (email: string, password: string, props: { skipToast?: boolean } = {}) => {
      try {
        await cloudApi.auth.logIn.mutate({ email, password });

        await getCurrentUser();

        if (!props.skipToast) {
          toast.add({
            title: 'Login successful',
            color: 'success',
          });
        }

        navigate(routes.root());
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Login failed',
        });
      }
    },
    [cloudApi, getCurrentUser, navigate, toast],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        await cloudApi.auth.signUp.mutate({ email, password });

        toast.add({
          title: 'Signup successful',
          color: 'success',
        });

        await logIn(email, password, { skipToast: true });
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Sign up failed',
        });
      }
    },
    [cloudApi, logIn, toast],
  );

  useEffectOnce(() => {
    getCurrentUser();
  });

  return useMemo(
    () => ({
      isInitializing,
      logIn,
      logOut,
      signUp,
      user,
    }),
    [user, logIn, logOut, signUp, isInitializing],
  );
};
