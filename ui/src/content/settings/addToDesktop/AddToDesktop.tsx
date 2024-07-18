import { InstallDesktopOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { AddToDesktopContext } from './Context';

export const AddToDesktop: React.FC = () => {
  const { canBeInstalled, install } = useDefinedContext(AddToDesktopContext);

  if (!canBeInstalled) {
    return null;
  }

  return (
    <Button
      color="primary"
      htmlProps={{ onClick: install }}
      icon={<InstallDesktopOutlined />}
      label="Add to Desktop"
    />
  );
};
