import { InstallDesktopOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AddToDesktopContext } from './Context';
import { AnalyticsContext } from '~/content/analytics/Context';

export const AddToDesktop: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { canBeInstalled, install } = useDefinedContext(AddToDesktopContext);

  if (!canBeInstalled) {
    return null;
  }

  return (
    <Button
      align="left"
      color="primary"
      htmlProps={{
        onClick: () => {
          install();
          track('settings_add_to_desktop');
        },
      }}
      icon={<InstallDesktopOutlined />}
      label="Add to Desktop"
    />
  );
};
