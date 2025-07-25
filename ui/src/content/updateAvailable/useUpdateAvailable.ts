import { registerSW } from 'virtual:pwa-register';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { useAnalytics } from '../analytics/useAnalytics';
import { ToastContext } from '../toast/Context';

export const useUpdateAvailable = () => {
  const { track } = useAnalytics();
  const toast = useDefinedContext(ToastContext);

  useEffectOnce(() => {
    if (!import.meta.env.PROD) {
      return;
    }

    const updateSW = registerSW({
      onNeedRefresh: () => {
        track('update_available');

        toast.add({
          color: 'primary',
          description: 'Refresh or click here to update',
          duration: Infinity,
          title: 'Update available',
          htmlProps: {
            onClick: () => {
              track('update_available_click');
              void updateSW();
            },
          },
        });
      },
      onOfflineReady: () => {
        toast.add({
          color: 'success',
          title: 'Dabase is ready for offline use',
        });
      },
    });
  });
};
