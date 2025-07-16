import { useCallback, useEffect, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { Modal } from '~/shared/components/modal/Modal';
import { useModal } from '~/shared/components/modal/useModal';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ErrorTrackingContext } from '../errors/tracking/Context';
import { ToastContext } from '../toast/Context';
import type { ToastProps } from '../toast/useToast';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { detectAdBlocker } from './detectAdBlocker';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';

export const ConsentModal: React.FC = () => {
  const errorTracking = useDefinedContext(ErrorTrackingContext);
  const toast = useDefinedContext(ToastContext);
  const [isAdBlockerEnabled, setIsAdBlockerEnabled] = useState(false);

  const modal = useModal();

  useEffect(() => {
    if (errorTracking.isConsentGranted === undefined) {
      setTimeout(() => {
        modal.open();
      });
    }
  }, [errorTracking.isConsentGranted, modal]);

  useEffectOnce(
    () => {
      detectAdBlocker().then(setIsAdBlockerEnabled);
    },
    { enabled: modal.isOpen },
  );

  const successToast = {
    color: 'success',
    description: 'You can change this later in Settings',
    title: 'Preferences saved',
  } satisfies Omit<ToastProps, 'id'>;

  const finalize = useCallback(
    (isConsentGranted: boolean) => {
      errorTracking.setIsConsentGranted(isConsentGranted);
      modal.close();
      toast.add(successToast);
    },
    [errorTracking, modal, successToast, toast],
  );

  return (
    <Modal {...modal} htmlProps={{ className: 'max-w-[400px]' }} title="Welcome to Dabase!">
      <div className="text-sm text-textTertiary">
        <p className="mb-2">
          By using Dabase, you agree to the{' '}
          <a className="underline" href={import.meta.env.VITE_TERMS_URL} target="_blank">
            Terms of Use
          </a>{' '}
          and the{' '}
          <a className="underline" href={import.meta.env.VITE_PRIVACY_URL} target="_blank">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          We also ask for your consent to collect anonymous analytics data to help us improve your
          experience.
        </p>
        {isAdBlockerEnabled && (
          <ErrorMessage htmlProps={{ className: 'mt-3' }}>
            Please disable your ad blocker for this site to help us improve your experience. We will
            never show ads.
          </ErrorMessage>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button htmlProps={{ onClick: () => finalize(false) }} label="Decline analytics" />
        <Button
          label="Accept and continue"
          variant="filled"
          htmlProps={{
            autoFocus: true,
            onClick: () => finalize(true),
          }}
        />
      </div>
    </Modal>
  );
};
