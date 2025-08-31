import type { AwsRumConfig } from 'aws-rum-web';
import { AwsRum } from 'aws-rum-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isUserUnauthorizedError } from '~/content/auth/isUserUnauthorizedError';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useErrorTracking = () => {
  const [rum, setRum] = useState<AwsRum | null>(null);

  const [isConsentGranted, setIsConsentGranted] = useStoredState<boolean | undefined>(
    'useErrorTracking.isConsentGranted.v2',
    undefined,
  );

  const trackError = useCallback((error: unknown) => rum?.recordError(error), [rum]);

  useEffect(() => {
    if (!import.meta.env.PROD || !isConsentGranted) {
      setRum(null);
      return;
    }

    const config: AwsRumConfig = {
      allowCookies: true,
      enableXRay: true,
      endpoint: 'https://dataplane.rum.eu-central-1.amazonaws.com',
      identityPoolId: 'eu-central-1:67e78910-d6cf-4ffd-90c6-b704bb711791',
      signing: false,
      telemetries: [
        ['errors', { ignore: (error: unknown) => isUserUnauthorizedError(error) }],
        'performance',
        'http',
      ],
    };

    const APPLICATION_ID: string = '7f8ee2fc-5755-4aeb-bdc2-5728435ae926';
    const APPLICATION_REGION: string = 'eu-central-1';

    setRum(new AwsRum(APPLICATION_ID, import.meta.env.VITE_UI_VERSION, APPLICATION_REGION, config));
  }, [isConsentGranted]);

  useEffect(() => {
    if (isConsentGranted) {
      rum?.enable();
    } else {
      rum?.disable();
    }
  }, [isConsentGranted, rum]);

  return useMemo(
    () => ({ isConsentGranted, setIsConsentGranted, trackError }),
    [isConsentGranted, setIsConsentGranted, trackError],
  );
};
