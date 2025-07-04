import React from 'react';
import { GitHub, PersonAddAlt1Outlined, VpnKeyOutlined } from '@mui/icons-material';
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
import { Toggle } from '~/shared/components/toggle/Toggle';
import { routes } from '~/router/routes';
import { ErrorTrackingContext } from '../errors/tracking/Context';

export type SettingsProps = {
  close: () => Promise<void>;
};

export const Settings: React.FC<SettingsProps> = ({ close }) => {
  const { isConsentGranted, setIsConsentGranted } = useDefinedContext(ErrorTrackingContext);
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
      <Field>
        <Toggle
          hint="Help improve Dabase"
          label="Share anonymous usage data"
          onChange={(value) => setIsConsentGranted(Boolean(value))}
          value={isConsentGranted}
        />
      </Field>
      <Field label="Ask questions and share your feedback, feature requests, and bug reports:">
        <Button
          color="secondary"
          element="a"
          htmlProps={{
            className: 'w-full',
            href: import.meta.env.VITE_DISCUSSIONS_URL,
            target: '_blank',
          }}
          icon={<GitHub />}
          label="GitHub Discussions"
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
      {!user && (
        <>
          <Button
            element="link"
            htmlProps={{
              href: routes.signup(),
              onClick: () => {
                track('settings_sign_up');
                void close();
              },
            }}
            icon={<PersonAddAlt1Outlined />}
            label="Sign up"
          />
          <Button
            element="link"
            htmlProps={{
              href: routes.login(),
              onClick: () => {
                track('settings_log_in');
                void close();
              },
            }}
            icon={<VpnKeyOutlined />}
            label="Log in"
          />
        </>
      )}
    </div>
  );
};
