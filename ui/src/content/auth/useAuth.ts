import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';
import { ApiContext } from '../api/Context';
import type { User } from './types';
import { useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ToastContext } from '../toast/Context';
import { routes } from '~/router/routes';

export const useAuth = () => {
  const [, navigate] = useLocation();

  const api = useDefinedContext(ApiContext);
  const toast = useDefinedContext(ToastContext);

  const [user, setUser] = useStoredState<User | null>('useAuth.user', null);

  const logIn = useCallback(
    async (email: string, password: string) => {
      try {
        const user = await api.auth.logIn.mutate({ email, password });

        setUser(user);

        toast.add({
          title: 'Login successful',
          color: 'success',
        });

        navigate(routes.root());
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Login failed',
        });
      }
    },
    [api.auth.logIn, navigate, setUser, toast],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        await api.auth.signUp.mutate({ email, password });

        toast.add({
          title: 'Signup successful',
          color: 'success',
        });

        navigate(routes.root());
      } catch (error) {
        console.error(error);

        toast.add({
          color: 'danger',
          title: 'Sign up failed',
        });
      }
    },
    [api.auth.signUp, navigate, toast],
  );

  return useMemo(
    () => ({
      logIn,
      signUp,
      user,
    }),
    [user, logIn, signUp],
  );
};
