import {
  CancelOutlined,
  CheckCircleOutline,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  FileDownloadOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { LinkContext } from '../Context';
import type { Os } from './types';
import { getCurrentOs, getDistributables, getDistributableUrl } from './utils';
import { useEffectOnce } from '~/shared/hooks/useEffectOnce/useEffectOnce';
import { AnalyticsContext } from '~/content/analytics/Context';
import classNames from 'classnames';
import { CircularProgress } from '@mui/material';
import { ConnectionsContext } from '~/content/connections/Context';

export type LinkSetupProps = {
  hideIfReadyOrCloud?: boolean;
};

export const LinkSetup: React.FC<LinkSetupProps> = (props) => {
  const { hideIfReadyOrCloud } = props;

  const { track } = useDefinedContext(AnalyticsContext);
  const { checkIfReady, isReady } = useDefinedContext(LinkContext);
  const { connectViaCloud } = useDefinedContext(ConnectionsContext);

  const [os, setOs] = useState<Os>(getCurrentOs());
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);
  const [hidden, setHidden] = useState(hideIfReadyOrCloud);

  useEffectOnce(() => {
    if (hideIfReadyOrCloud && connectViaCloud) {
      setCheckingLinkStatus(false);
      return;
    }

    void checkIfReady().then((isReady) => {
      if (hideIfReadyOrCloud && isReady === false && !connectViaCloud) {
        setHidden(false);
      }
    });
  });

  const handleVerifyLinkInstallation = useCallback(() => {
    track('link_recheck');

    setCheckingLinkStatus(true);

    void checkIfReady().then((isReady) => {
      if (isReady) {
        track('link_recheck_success');
      } else {
        track('link_recheck_fail');
      }
      setCheckingLinkStatus(false);
    });
  }, [checkIfReady, track]);

  const [isOpen, setIsOpen] = useState(false);

  if (hidden) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2">
        <div
          className={classNames('flex items-center gap-2 text-sm font-medium', {
            'text-success': isReady,
            'text-danger': isReady === false,
            'text-textSecondary': isReady === null,
          })}
        >
          {isReady === true && (
            <>
              <CheckCircleOutline />
              <div>Link is ready</div>
            </>
          )}
          {isReady === false && (
            <>
              <CancelOutlined />
              <div>Link not detected</div>
            </>
          )}
          {isReady === null && (
            <>
              <CircularProgress size={16} />
              <div className="text-textSecondary">Checking Link status...</div>
            </>
          )}
        </div>
        <Button
          color="secondary"
          htmlProps={{ disabled: checkingLinkStatus, onClick: handleVerifyLinkInstallation }}
          icon={<RefreshOutlined />}
          tooltip="Re-check Link status"
        />
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <div
          className="flex cursor-pointer items-center justify-between gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="text-xs font-medium text-textSecondary">Install SmartQuery Link</div>
          {isOpen ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
        </div>
        {isOpen && (
          <div className="flex flex-col gap-2">
            <div className="text-xs leading-snug text-textSecondary">
              This background service enables database connections from your browser.
            </div>
            <div className="flex flex-col gap-2">
              <ButtonSelect<Os>
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
              <div className="flex gap-2">
                {getDistributables(os).map((distributable) => (
                  <Button
                    element="a"
                    htmlProps={{
                      className: 'grow basis-0',
                      href: getDistributableUrl(distributable),
                      onClick: () =>
                        track('link_setup_download', {
                          os,
                          file_extension: distributable.fileExtension,
                        }),
                    }}
                    icon={<FileDownloadOutlined />}
                    key={getDistributableUrl(distributable)}
                    label={`.${distributable.fileExtension} (${distributable.arch})`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
