import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CloudApiContext } from '../cloud/api/Context';
import type { User } from './types';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { ToastContext } from '../toast/Context';
import { routes } from '~/router/routes';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { isUserUnauthorizedError } from './isUserUnauthorizedError';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useAuth = () => {
  const [, navigate] = useLocation();

  const { cloudApi } = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);

  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useStoredState<User | null>('useAuth.user', null);
  const refreshIntervalRef = useRef<number | null>(null);

  const logOut = useCallback(
    async (props: { silent?: boolean } = {}) => {
      setUser(null);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      await cloudApi.auth.logOut.mutate();

      if (!props.silent) {
        toast.add({
          title: 'Logout successful',
          color: 'success',
        });

        navigate(routes.root());
      }
    },
    [cloudApi.auth.logOut, navigate, setUser, toast],
  );

  // Effect to automatically refresh access token 1 minute before expiry
  useEffect(() => {
    if (!user) return;

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up interval to refresh token every 14 minutes (1 minute before 15-minute expiry)
    refreshIntervalRef.current = setInterval(
      async () => {
        try {
          await cloudApi.auth.refresh.mutate();
        } catch {
          await logOut({ silent: true });
        }
      },
      14 * 60 * 1000,
    ) as unknown as number;

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [cloudApi.auth.refresh, logOut, user]);

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
  }, [cloudApi, logOut, setUser]);

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
        await cloudApi.auth.signUp.mutate({ email, password }, { context: { useWafFetch: true } });

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
    void cloudApi.auth.refresh.mutate().then(() => getCurrentUser());
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
