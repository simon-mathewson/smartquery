import type { AwsRumConfig } from 'aws-rum-web';
import { AwsRum } from 'aws-rum-web';

export const setUpErrorTracking = () => {
  if (!import.meta.env.PROD) {
    return null;
  }

  const config: AwsRumConfig = {
    identityPoolId: 'eu-central-1:cbafc5b5-01fc-495d-b36b-552f93ba1acb',
    endpoint: 'https://dataplane.rum.eu-central-1.amazonaws.com',
    allowCookies: true,
    enableXRay: true,
    signing: false,
  };

  const APPLICATION_ID: string = 'd51e93b1-3986-44e8-b1d7-5d450b83b77c';
  const APPLICATION_VERSION: string = '1.0.0';
  const APPLICATION_REGION: string = 'eu-central-1';

  return new AwsRum(APPLICATION_ID, APPLICATION_VERSION, APPLICATION_REGION, config);
};
