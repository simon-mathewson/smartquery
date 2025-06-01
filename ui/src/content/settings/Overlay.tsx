import { SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { Button } from '~/shared/components/button/Button';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { Settings } from './Settings';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AuthContext } from '../auth/Context';
import classNames from 'classnames';

export const SettingsOverlay: React.FC = () => {
  const { user } = useDefinedContext(AuthContext);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button
        align="left"
        color="secondary"
        htmlProps={{
          className: classNames('fixed bottom-2 left-2', { 'w-[208px]': user }),
          ref: triggerRef,
        }}
        icon={<SettingsOutlined />}
        label={user?.email}
      />
      <OverlayCard
        align="center"
        htmlProps={{ className: 'w-[340px]' }}
        darkenBackground
        triggerRef={triggerRef}
      >
        {({ close }) => <Settings close={close} />}
      </OverlayCard>
    </>
  );
};
