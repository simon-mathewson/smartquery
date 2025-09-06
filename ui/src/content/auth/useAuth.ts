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
import { AnalyticsContext } from '../analytics/Context';

const TOKEN_EXPIRY_DURATION = 15 * 60 * 1000; // 15 minutes
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (1 minute before expiry)

export const useAuth = () => {
  const [, navigate] = useLocation();

  const { cloudApi } = useDefinedContext(CloudApiContext);
  const toast = useDefinedContext(ToastContext);
  const { track } = useDefinedContext(AnalyticsContext);

  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useStoredState<User | null>('useAuth.user', null);
  const refreshIntervalRef = useRef<number | null>(null);
  const lastRefreshTimeRef = useRef<number>(Date.now());

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

  const refreshAuth = useCallback(async () => {
    try {
      await cloudApi.auth.refresh.mutate();
      lastRefreshTimeRef.current = Date.now();
    } catch {
      await logOut({ silent: true });
    }
  }, [cloudApi.auth.refresh, logOut]);

  const shouldRefreshToken = useCallback(() => {
    const timeSinceLastRefresh = Date.now() - lastRefreshTimeRef.current;
    return timeSinceLastRefresh > TOKEN_EXPIRY_DURATION;
  }, []);

  // Effect to automatically refresh access token 1 minute before expiry
  useEffect(() => {
    if (!user) return;

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up interval to refresh token every 14 minutes (1 minute before 15-minute expiry)
    refreshIntervalRef.current = setInterval(async () => {
      await refreshAuth();
    }, REFRESH_INTERVAL) as unknown as number;

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [refreshAuth, user]);

  // Effect to refresh auth when user returns to tab after being inactive
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldRefreshToken()) {
        await refreshAuth();
      }
    };

    const handleFocus = async () => {
      if (shouldRefreshToken()) {
        await refreshAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshAuth, shouldRefreshToken, user]);

  const getCurrentUser = useCallback(async () => {
    const user = await cloudApi.auth.currentUser.query();
    setUser(user);
  }, [cloudApi, setUser]);

  const logIn = useCallback(
    async (
      email: string,
      password: string,
      props: { skipToast?: boolean; onSuccess?: () => void } = {},
    ) => {
      try {
        await cloudApi.auth.logIn.mutate({ email, password });

        await getCurrentUser();

        if (!props.skipToast) {
          toast.add({
            title: 'Login successful',
            color: 'success',
          });
        }

        props.onSuccess?.();
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Login failed',
        });
      }
    },
    [cloudApi, getCurrentUser, toast],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        await cloudApi.auth.signUp.mutate({ email, password }, { context: { useWafFetch: true } });

        track('signup_success');

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
    [cloudApi, logIn, toast, track],
  );

  useEffectOnce(() => {
    void cloudApi.auth.refresh
      .mutate()
      .then(() => getCurrentUser())
      .catch((error) => {
        if (isUserUnauthorizedError(error)) {
          void logOut({ silent: true });
          return;
        }

        throw error;
      })
      .finally(() => setIsInitializing(false));
  });

  return useMemo(
    () => ({
      getCurrentUser,
      isInitializing,
      logIn,
      logOut,
      signUp,
      user,
    }),
    [getCurrentUser, isInitializing, logIn, logOut, signUp, user],
  );
};
