import { FileDownloadOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import { NativeContext } from '~/content/native/Context';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import type { Os } from './types';
import { getCurrentOs, getDistributables, getDistributableUrl } from './utils';

export const DesktopSetup: React.FC = () => {
  const native = useDefinedContext(NativeContext);
  const { track } = useDefinedContext(AnalyticsContext);

  const [os, setOs] = useState<Os>(getCurrentOs());

  if (native.isNative) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-textSecondary">Install SmartQuery Desktop</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-xs leading-snug text-textSecondary">
            Postgres and MySQL require SmartQuery's desktop app.
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
                      track('desktop_setup_download', {
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
      </div>
    </div>
  );
};
