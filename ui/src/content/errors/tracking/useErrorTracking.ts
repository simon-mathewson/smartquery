import type { AwsRumConfig } from 'aws-rum-web';
import { AwsRum } from 'aws-rum-web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isUserUnauthorizedError } from '~/content/auth/isUserUnauthorizedError';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

export const useErrorTracking = () => {
  const [rum, setRum] = useState<AwsRum | null>(null);

  const [isConsentGranted, setIsConsentGranted] = useStoredState(
    'useErrorTracking.isConsentGranted',
    false,
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
      identityPoolId: 'eu-central-1:cbafc5b5-01fc-495d-b36b-552f93ba1acb',
      signing: false,
      telemetries: [
        ['errors', { ignore: (error: unknown) => isUserUnauthorizedError(error) }],
        'performance',
        'http',
      ],
    };

    const APPLICATION_ID: string = 'd51e93b1-3986-44e8-b1d7-5d450b83b77c';
    const APPLICATION_REGION: string = 'eu-central-1';

    setRum(new AwsRum(APPLICATION_ID, import.meta.env.VITE_VERSION, APPLICATION_REGION, config));
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
