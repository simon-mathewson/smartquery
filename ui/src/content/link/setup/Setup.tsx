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
import { CircularProgress } from '@mui/material';

export const Setup: React.FC = () => {
  const navigate = useNavigate();

  const link = useDefinedContext(LinkContext);

  const [os, setOs] = useState<Os>(getCurrentOs());
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);

  const handleContinue = useCallback(() => {
    setCheckingLinkStatus(true);

    void link.waitUntilReady().then(() => {
      navigate(routes.root());
    });
  }, [link, navigate]);

  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <Logo className="w-16" />
      <Card className="flex w-[360px] flex-col gap-3 p-4">
        {!checkingLinkStatus ? (
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
            <Button
              icon={<ArrowForward />}
              label="Continue"
              onClick={handleContinue}
              variant="filled"
            />
          </>
        ) : (
          <>
            <div className="text-center text-lg font-medium text-textSecondary">
              Looking for Dabase Link...
            </div>
            <div className="flex justify-center">
              <CircularProgress className="!text-primary" size={24} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
