import { Amplify } from 'aws-amplify';
import Analytics from 'aws-amplify/analytics';

export const setUpAnalytics = () => {
  const { VITE_AWS_COGNITO_IDENTITY_POOL_ID, VITE_AWS_PINPOINT_APP_ID, VITE_AWS_REGION } =
    import.meta.env;

  if (!VITE_AWS_COGNITO_IDENTITY_POOL_ID || !VITE_AWS_PINPOINT_APP_ID || !VITE_AWS_REGION) {
    if (import.meta.env.DEV) return;

    throw new Error('Missing environment variables for AWS Amplify');
  }

  Amplify.configure({
    Analytics: {
      Pinpoint: {
        appId: VITE_AWS_PINPOINT_APP_ID,
        region: VITE_AWS_REGION,
      },
    },
    Auth: {
      Cognito: {
        identityPoolId: VITE_AWS_COGNITO_IDENTITY_POOL_ID,
      },
    },
  });

  Analytics.configureAutoTrack({
    enable: true,
    type: 'pageView',
    options: { appType: 'singlePage' },
  });

  Analytics.configureAutoTrack({
    enable: true,
    type: 'session',
  });
};
