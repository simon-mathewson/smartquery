import { FileDownloadOutlined } from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkContext } from '../Context';
import type { Os } from './types';
import { getCurrentOs, getDistributables, getDistributableUrl } from './utils';
import { PublishedWithChangesOutlined as VerifyLinkIcon } from '@mui/icons-material';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { AnalyticsContext } from '~/content/analytics/Context';

type SetupProps = {
  databaseLabel: string;
};

export const Setup: React.FC<SetupProps> = (props) => {
  const { databaseLabel } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const link = useDefinedContext(LinkContext);

  const [os, setOs] = useState<Os>(getCurrentOs());
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);
  const [linkStatus, setLinkStatus] = useState<'unknown' | 'ready' | 'notReady'>('unknown');
  const [hidden, setHidden] = useState(false);

  useEffectOnce(() => {
    void link.getIsReady().then((isReady) => {
      setHidden(isReady);
    });
  });

  const handleVerifyLinkInstallation = useCallback(() => {
    track('link_setup_test');

    setCheckingLinkStatus(true);

    void link.getIsReady().then((isReady) => {
      if (isReady) {
        setLinkStatus('ready');
        track('link_setup_test_success');
      } else {
        setLinkStatus('notReady');
        track('link_setup_test_fail');
      }
      setCheckingLinkStatus(false);
    });
  }, [link]);

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="pb-2 pl-1 pt-3 text-xs leading-snug text-textSecondary">
        To connect to {databaseLabel} install Dabase Link, a background service that allows Dabase
        to connect to your databases.
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
          {getDistributables(os).map((distributable) => (
            <Button
              element="a"
              htmlProps={{
                className: 'grow basis-0',
                href: getDistributableUrl(distributable),
                onClick: () =>
                  track('link_setup_download', { os, file_extension: distributable.fileExtension }),
              }}
              icon={<FileDownloadOutlined />}
              key={getDistributableUrl(distributable)}
              label={`.${distributable.fileExtension} (${distributable.arch})`}
            />
          ))}
        </div>
      </div>
      <div className="text-xs leading-snug text-textSecondary">
        Once Link is installed and running, verify the installation:
      </div>
      <Button
        color={
          (
            {
              notReady: 'danger',
              ready: 'success',
              unknown: 'primary',
            } as const
          )[linkStatus]
        }
        htmlProps={{ disabled: checkingLinkStatus, onClick: handleVerifyLinkInstallation }}
        icon={<VerifyLinkIcon />}
        label={
          {
            notReady: 'Unable to reach Link',
            ready: 'Link is ready',
            unknown: 'Verify Link installation',
          }[linkStatus]
        }
      />
    </>
  );
};
