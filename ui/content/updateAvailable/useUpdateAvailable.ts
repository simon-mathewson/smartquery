import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ToastContext } from '../toast/Context';
import { useAnalytics } from '../analytics/useAnalytics';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { registerSW } from 'virtual:pwa-register';

export const useUpdateAvailable = () => {
  const { track } = useAnalytics();
  const toast = useDefinedContext(ToastContext);

  useEffectOnce(() => {
    const updateSw = registerSW({
      onNeedRefresh() {
        track('update_available');

        toast.add({
          color: 'primary',
          description: 'Refresh or click here to update',
          title: 'Update available',
          duration: Infinity,
          htmlProps: {
            onClick: () => {
              track('update_available_click');
              void updateSw();
            },
          },
        });
      },
      onOfflineReady() {
        track('offline_ready');

        toast.add({
          color: 'primary',
          title: 'App is ready to work offline',
        });
      },
    });
  });
};
