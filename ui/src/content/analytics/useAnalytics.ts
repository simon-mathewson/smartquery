import { useCallback, useEffect } from 'react';
import ReactGa from 'react-ga4';
import { useLocation } from 'wouter';
import { useStoredState } from '~/shared/hooks/useStoredState/useStoredState';

if (import.meta.env.PROD) {
  ReactGa.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID);
}

export const useAnalytics = () => {
  const [location] = useLocation();

  const [isConsentGranted, setIsConsentGranted] = useStoredState(
    'useAnalytics.isConsentGranted',
    false,
  );

  const allow = useCallback(() => {
    setIsConsentGranted(true);
  }, []);

  const deny = useCallback(() => {
    setIsConsentGranted(false);
  }, []);

  const track = useCallback((event: string, props?: Record<string, string>) => {
    if (import.meta.env.PROD) {
      ReactGa.event(event, props);
    } else {
      console.log('event', event, props);
    }
  }, []);

  // Update analytics consent
  useEffect(() => {
    if (isConsentGranted) {
      if (import.meta.env.PROD) {
        ReactGa.gtag('consent', 'update', {
          ad_user_data: 'granted',
          ad_personalization: 'granted',
          ad_storage: 'granted',
          analytics_storage: 'granted',
        });
      } else {
        console.log('Analytics consent granted');
      }
    } else {
      if (import.meta.env.PROD) {
        ReactGa.gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
        });
      } else {
        console.log('Analytics consent denied');
      }
    }
  }, [isConsentGranted]);

  // Track page views
  useEffect(() => {
    if (import.meta.env.PROD) {
      ReactGa.send({ hitType: 'pageview', page: location });
    } else {
      console.log('pageview', location);
    }
  }, [location]);

  return {
    allow,
    deny,
    isConsentGranted,
    track,
  };
};
