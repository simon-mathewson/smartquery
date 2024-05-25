import { useCallback, useState } from 'react';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Card } from '~/shared/components/card/Card';
import { Logo } from '~/shared/components/logo/Logo';
import type { Os } from './types';
import { getCurrentOs, getDistributableUrl } from './utils';
import { distributablesByOs } from './constants';
import { Button } from '~/shared/components/Button/Button';
import { ArrowForward, FileDownloadOutlined } from '@mui/icons-material';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { LinkContext } from '../Context';
import { useNavigate } from 'react-router-dom';
import { routes } from '~/router/routes';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { Settings } from '~/content/settings/Settings';

export const Setup: React.FC = () => {
  const navigate = useNavigate();

  const link = useDefinedContext(LinkContext);

  const [os, setOs] = useState<Os>(getCurrentOs());
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);
  const [showLinkNotReady, setShowLinkNotReady] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const handleContinue = useCallback(() => {
    setCheckingLinkStatus(true);

    void link.getIsReady().then((isReady) => {
      if (isReady) {
        setShowSettings(true);
      } else {
        setShowLinkNotReady(true);
        setCheckingLinkStatus(false);
      }
    });
  }, [link]);

  const handleFinish = useCallback(() => {
    navigate(routes.root());
  }, [navigate]);

  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <Logo className="w-16" />
      <Card className="flex w-[360px] flex-col gap-3 p-4">
        {!showSettings ? (
          <>
            <div className="text-center text-lg font-medium text-textSecondary">
              Welcome to Dabase!
            </div>
            <div className="text-sm leading-snug text-textSecondary">
              To use Dabase, you need to install Dabase Link, a background service that allows
              Dabase to connect to your databases.
            </div>
            <div className="flex flex-col gap-2">
              <ButtonSelect<Os>
                equalWidth
                fullWidth
                onChange={setOs}
                options={[
                  { button: { label: 'Linux' }, value: 'linux' },
                  { button: { label: 'Mac' }, value: 'mac' },
                  { button: { label: 'Windows' }, value: 'windows' },
                ]}
                required
                value={os}
              />
              <div className="flex flex-col gap-2">
                {distributablesByOs[os].map((distributable) => (
                  <Button
                    className="grow basis-0"
                    element="a"
                    href={getDistributableUrl(distributable)}
                    icon={<FileDownloadOutlined />}
                    key={getDistributableUrl(distributable)}
                    label={`.${distributable.fileExtension} (${distributable.arch})`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm leading-snug text-textSecondary">
              Once Dabase Link is installed and running, click continue.
            </div>
            {showLinkNotReady && (
              <ErrorMessage>
                Unable to reach Dabase Link. Please make sure it is installed and running.
              </ErrorMessage>
            )}
            <Button
              disabled={checkingLinkStatus}
              icon={<ArrowForward />}
              label="Continue"
              onClick={handleContinue}
              variant="filled"
            />
          </>
        ) : (
          <>
            <Settings />
            <Button
              icon={<ArrowForward />}
              label="Continue"
              onClick={handleFinish}
              variant="filled"
            />
          </>
        )}
      </Card>
    </div>
  );
};
