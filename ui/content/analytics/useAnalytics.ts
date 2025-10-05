import { useCallback, useEffect } from 'react';
import ReactGa from 'react-ga4';
import { useLocation } from 'wouter';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ErrorTrackingContext } from '../errors/tracking/Context';

if (import.meta.env.PROD) {
  ReactGa.gtag('consent', 'default', {
    ad_personalization: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    analytics_storage: 'denied',
  });

  ReactGa.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
    gtagOptions: {
      // Ensure all page views are tracked by us
      send_page_view: false,
    },
  });
}

export const useAnalytics = () => {
  const [location] = useLocation();

  const { isConsentGranted } = useDefinedContext(ErrorTrackingContext);

  const track = useCallback(
    (event: string, props?: Record<string, string | number | boolean | null | undefined>) => {
      if (!isConsentGranted) {
        return;
      }

      if (import.meta.env.PROD) {
        ReactGa.event(event, props);
      } else {
        console.log('event', event, props);
      }
    },
    [isConsentGranted],
  );

  // Update analytics consent
  useEffect(() => {
    if (isConsentGranted) {
      if (import.meta.env.PROD) {
        ReactGa.gtag('consent', 'update', {
          ad_personalization: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          analytics_storage: 'granted',
        });
      } else {
        console.log('Analytics consent granted');
      }
    } else {
      if (import.meta.env.PROD) {
        ReactGa.gtag('consent', 'update', {
          ad_personalization: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          analytics_storage: 'denied',
        });
      } else {
        console.log('Analytics consent denied');
      }
    }
  }, [isConsentGranted]);

  // Track page views
  useEffect(() => {
    if (!isConsentGranted) {
      return;
    }

    if (import.meta.env.PROD) {
      ReactGa.send({ hitType: 'pageview', page: location });
    } else {
      console.log('pageview', location);
    }
  }, [isConsentGranted, location]);

  return { track };
};
