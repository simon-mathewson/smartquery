import { useRef } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ToastContext } from '../toast/Context';
import { useAnalytics } from '../analytics/useAnalytics';
import { assert } from 'ts-essentials';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const useUpdateAvailable = () => {
  const { track } = useAnalytics();
  const toast = useDefinedContext(ToastContext);

  const intervalRef = useRef<number | undefined>(undefined);

  useEffectOnce(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    intervalRef.current = setInterval(
      () => {
        void fetch('/version')
          .then((res) => {
            assert(res.ok, 'Failed to fetch version');
            return res.text();
          })
          .then((version) => {
            if (version !== import.meta.env.VITE_UI_VERSION) {
              clearInterval(intervalRef.current);

              track('update_available');

              toast.add({
                color: 'primary',
                description: 'Refresh or click here to update',
                duration: Infinity,
                title: 'Update available',
                htmlProps: {
                  onClick: () => {
                    track('update_available_click');
                    location.reload();
                  },
                },
              });
            }
          });
      },
      5 * 60 * 1000,
    ) as unknown as number;

    return () => {
      clearInterval(intervalRef.current);
    };
  });
};
