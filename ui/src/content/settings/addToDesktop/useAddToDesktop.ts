import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const useAddToDesktop = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  const install = useCallback(() => {
    void promptEvent?.prompt();
  }, [promptEvent]);

  useEffect(() => {
    const handleAppInstalled = () => {
      setPromptEvent(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleBeforeInstallPrompt = useCallback((event: BeforeInstallPromptEvent) => {
    setPromptEvent(event);
  }, []);

  useEffectOnce(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener('beforeinstallprompt' as any, handleBeforeInstallPrompt);

    return () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.removeEventListener('beforeinstallprompt' as any, handleBeforeInstallPrompt);
  });

  return useMemo(() => ({ canBeInstalled: promptEvent !== null, install }), [install, promptEvent]);
};
