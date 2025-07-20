import React, { useCallback } from 'react';
import { assert } from 'ts-essentials';
import { Loading } from '~/shared/components/loading/Loading';
import { Modal } from '~/shared/components/modal/Modal';
import { ModalControl } from '~/shared/components/modal/types';

export type CaptchaModalProps = {
  modalControl: ModalControl<{ onSuccess: () => void }>;
};

export const CaptchaModal: React.FC<CaptchaModalProps> = ({ modalControl }) => {
  const render = useCallback(async (container: HTMLDivElement | null) => {
    if (!container) {
      return;
    }

    container.innerHTML = '';

    if (!import.meta.env.PROD) {
      const mockCaptcha = document.createElement('div');

      mockCaptcha.textContent = 'Mock captcha. Click to continue.';
      mockCaptcha.style.width = '100%';
      mockCaptcha.style.height = '200px';
      mockCaptcha.style.backgroundColor = '#ccc';

      container.append(mockCaptcha);

      mockCaptcha.addEventListener('click', () => {
        modalControl.input?.onSuccess();
      });
      return;
    }

    assert(import.meta.env.VITE_AWS_WAF_CAPTCHA_API_KEY, 'Captcha API key not found');

    if (!window.AwsWafCaptcha) {
      await new Promise((resolve) => {
        assert(import.meta.env.VITE_AWS_WAF_CAPTCHA_SCRIPT_URL, 'Captcha script URL not found');

        const script = document.createElement('script');
        script.src = import.meta.env.VITE_AWS_WAF_CAPTCHA_SCRIPT_URL;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }

    assert(window.AwsWafCaptcha, 'Captcha script not loaded');

    window.AwsWafCaptcha.renderCaptcha(container, {
      apiKey: import.meta.env.VITE_AWS_WAF_CAPTCHA_API_KEY,
      onSuccess: () => {
        assert(modalControl.input);
        modalControl.input.onSuccess();
      },
      skipTitle: true,
    });
  }, []);

  return (
    <Modal {...modalControl} title="Please confirm that you are human">
      <div ref={render}>
        <Loading />
      </div>
    </Modal>
  );
};
