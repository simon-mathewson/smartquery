import { SettingsOutlined } from '@mui/icons-material';
import { useRef } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ThemeContext } from '../theme/Context';
import type { ThemeModePreference } from '../theme/types';
import { Field } from '~/shared/components/Field/Field';

export const Settings: React.FC = () => {
  const { modePreference, setModePreference } = useDefinedContext(ThemeContext);

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button color="secondary" icon={<SettingsOutlined />} ref={triggerRef} />
      <OverlayCard align="center" className="w-[340px]" darkenBackground triggerRef={triggerRef}>
        {() => (
          <div className="flex flex-col gap-1 pb-2 pt-1">
            <div className="truncate text-center text-lg font-medium">Settings</div>
            <Field label="Theme">
              <ButtonSelect<ThemeModePreference>
                equalWidth
                fullWidth
                onChange={setModePreference}
                options={[
                  { button: { label: 'System' }, value: 'system' },
                  { button: { label: 'Light' }, value: 'light' },
                  { button: { label: 'Dark' }, value: 'dark' },
                ]}
                required
                value={modePreference}
              />
            </Field>
          </div>
        )}
      </OverlayCard>
    </>
  );
};
