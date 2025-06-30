import React from 'react';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import type { ThemeModePreference } from '../theme/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeContext } from '../theme/Context';
import { AddToDesktop } from './addToDesktop/AddToDesktop';
import { AiContext } from '../ai/Context';
import { Input } from '~/shared/components/input/Input';
import { AuthContext } from '../auth/Context';
import { Button } from '~/shared/components/button/Button';
import { LogoutOutlined } from '@mui/icons-material';
import { AnalyticsContext } from '../analytics/Context';

export type SettingsProps = {
  close: () => Promise<void>;
};

export const Settings: React.FC<SettingsProps> = ({ close }) => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { logOut, user } = useDefinedContext(AuthContext);
  const { modePreference, setModePreference } = useDefinedContext(ThemeContext);
  const { googleAiApiKey, setGoogleAiApiKey } = useDefinedContext(AiContext);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-1 text-center text-sm font-medium text-textPrimary">
        Settings
      </div>
      <Field label="Theme">
        <ButtonSelect<ThemeModePreference>
          equalWidth
          fullWidth
          onChange={(value) => {
            setModePreference(value);
            track('settings_theme', { value });
          }}
          options={[
            { button: { label: 'System' }, value: 'system' },
            { button: { label: 'Light' }, value: 'light' },
            { button: { label: 'Dark' }, value: 'dark' },
          ]}
          required
          value={modePreference}
        />
      </Field>
      <Field
        hint={
          <>
            Get a free key at{' '}
            <a className="underline" href="https://aistudio.google.com/apikey" target="_blank">
              aistudio.google.com/apikey
            </a>
          </>
        }
        label="Google AI API Key"
      >
        <Input
          onChange={(value) => {
            setGoogleAiApiKey(value);
            track('settings_google_ai_api_key', { value: Boolean(value) });
          }}
          htmlProps={{
            type: 'password',
            value: googleAiApiKey,
          }}
        />
      </Field>
      <AddToDesktop />
      {user && (
        <Button
          htmlProps={{
            onClick: () => {
              void close();
              void logOut();
              track('settings_log_out');
            },
          }}
          icon={<LogoutOutlined />}
          label="Log out"
        />
      )}
    </div>
  );
};
