import { InstallDesktopOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';

export const AddToDesktop: React.FC = () => {
  const [promptFn, setPromptFn] = useState<(() => void) | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  useEffectOnce(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setPromptFn(event.prompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  });

  useEffectOnce(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  });

  if (!promptFn || isInstalled) {
    return null;
  }

  return (
    <Button
      color="primary"
      icon={<InstallDesktopOutlined />}
      label="Add to Desktop"
      onClick={promptFn}
    />
  );
};
