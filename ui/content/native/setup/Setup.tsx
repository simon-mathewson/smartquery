import type { Arch, Os } from '@/desktop/distributables';
import { detectOS, distributables } from '@/desktop/distributables';
import { ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { DistributableLink } from './DistributableLink';

export const NativeSetup: React.FC = () => {
  const [currentOs, setCurrentOs] = useState<{
    os: Os;
    arch: Arch;
  } | null>(null);

  useEffect(() => {
    void detectOS().then(setCurrentOs);
  }, []);

  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);

  const currentDistributable =
    distributables.find(
      ({ arch, os }) => os === currentOs?.os && (arch === currentOs?.arch || arch === 'universal'),
    ) ?? distributables.find(({ os }) => os === 'macos')!;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-textSecondary">Install SmartQuery</div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs leading-snug text-textSecondary">
          Postgres and MySQL require SmartQuery's desktop or mobile app.
        </div>
        <DistributableLink distributable={currentDistributable} highlight />
        <button
          className="text-testSecondary flex cursor-pointer items-center justify-center gap-0.5 text-sm font-medium"
          onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
          type="button"
        >
          {showOtherPlatforms ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          {showOtherPlatforms ? 'Hide other platforms' : 'Show other platforms'}
        </button>
        {showOtherPlatforms && (
          <div className="flex flex-col gap-2">
            {distributables
              .filter(
                ({ arch, os }) =>
                  os !== currentDistributable?.os || arch !== currentDistributable?.arch,
              )
              .map((distributable) => (
                <DistributableLink
                  key={distributable.os + distributable.arch}
                  distributable={distributable}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
