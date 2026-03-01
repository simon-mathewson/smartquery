import {
  ArrowBackOutlined,
  BrushOutlined,
  InstallDesktopOutlined,
  LogoutOutlined,
  PersonAddAlt1Outlined,
  QuestionAnswerOutlined,
  ReplayOutlined,
  SettingsOutlined,
  SpeedOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { assert } from 'ts-essentials';
import { routes } from '~/router/routes';
import { AboutLinks } from '~/shared/components/aboutLinks/AboutLinks';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { List } from '~/shared/components/list/List';
import { ThemeColorSelect } from '~/shared/components/themeColorSelect/ThemeColorSelect';
import { Toggle } from '~/shared/components/toggle/Toggle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { AnalyticsContext } from '../analytics/Context';
import { AuthContext } from '../auth/Context';
import { NativeSetup } from '../native/setup/Setup';
import { ErrorTrackingContext } from '../errors/tracking/Context';
import { isNative } from '../native/useNative';
import { ThemeContext } from '../theme/Context';
import type { ThemeModePreference } from '../theme/types';
import { AddToDesktop } from './addToDesktop/AddToDesktop';
import { DeleteAccount } from './deleteAccount/DeleteAccount';
import { Subscription } from './Subscription';
import { Usage } from './usage/Usage';
import { CopilotContext } from '../ai/copilot/Context';
import { Input } from '~/shared/components/input/Input';

export type SettingsProps = {
  close: () => Promise<void> | void;
};

const sections = ['home', 'general', 'install', 'appearance', 'usage', 'subscription'] as const;
type Section = (typeof sections)[number];

const labels: Record<Section, string> = {
  appearance: 'Appearance',
  install: 'Install',
  general: 'General',
  home: 'Settings',
  subscription: 'Subscription',
  usage: 'Usage',
} as const;

export const Settings: React.FC<SettingsProps> = ({ close }) => {
  const isMobile = useIsMobile();

  const { isConsentGranted, grantConsent, revokeConsent } = useDefinedContext(ErrorTrackingContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { logOut, user } = useDefinedContext(AuthContext);
  const { modePreference, setModePreference, primaryColor, setPrimaryColor } =
    useDefinedContext(ThemeContext);
  const { openaiApiKey, setOpenaiApiKey } = useDefinedContext(CopilotContext);

  const [section, setSection] = useState<Section>('home');

  return (
    <div className="flex h-full flex-col gap-2">
      <Header
        left={
          section !== 'home' && (
            <Button
              htmlProps={{
                onClick: () => setSection('home'),
              }}
              icon={<ArrowBackOutlined />}
            />
          )
        }
        middle={labels[section]}
      />
      {section === 'home' && (
        <List
          items={[
            {
              icon: <SettingsOutlined />,
              label: labels.general,
              value: 'general',
            },
            ...(isNative
              ? []
              : [
                  {
                    icon: <InstallDesktopOutlined />,
                    label: labels.install,
                    value: 'install',
                  },
                ]),
            {
              icon: <BrushOutlined />,
              label: labels.appearance,
              value: 'appearance',
            },
            ...(user
              ? [
                  {
                    icon: <SpeedOutlined />,
                    label: labels.usage,
                    value: 'usage',
                  },
                  ...(user.activeSubscription
                    ? [
                        {
                          icon: <ReplayOutlined />,
                          label: labels.subscription,
                          value: 'subscription',
                        },
                      ]
                    : []),
                  {
                    icon: <LogoutOutlined />,
                    label: 'Log out',
                    onSelect: () => {
                      void close();
                      void logOut();
                      track('settings_log_out');
                    },
                    value: 'logOut',
                  },
                ]
              : []),
            ...(!user
              ? [
                  {
                    element: 'link' as const,
                    htmlProps: {
                      href: routes.signup(),
                    },
                    icon: <PersonAddAlt1Outlined />,
                    label: 'Sign up',
                    onSelect: () => {
                      track('settings_sign_up');
                      void close();
                    },
                    value: 'signUp',
                  },
                  {
                    element: 'link' as const,
                    htmlProps: {
                      href: routes.login(),
                    },
                    icon: <VpnKeyOutlined />,
                    label: 'Log in',
                    onSelect: () => {
                      track('settings_log_in');
                      void close();
                    },
                    value: 'logIn',
                  },
                ]
              : []),
          ]}
          onSelect={(value) => {
            assert(sections.includes(value as Section), 'Invalid section');
            setSection(value as Section);
          }}
        />
      )}
      {section !== 'home' && (
        <div className="flex grow flex-col gap-2 p-2">
          {section === 'general' && (
            <>
              <Field
                hint="Used for Copilot and inline completions. Stored locally in your browser."
                label="OpenAI API key"
              >
                <Input
                  htmlProps={{
                    autoComplete: 'off',
                    type: 'password',
                    value: openaiApiKey,
                  }}
                  onChange={(value) => setOpenaiApiKey(value)}
                />
              </Field>
              <Field>
                <Toggle
                  hint="Help improve SmartQuery"
                  label="Share anonymous usage data"
                  onChange={(value) => {
                    if (value) {
                      void grantConsent();
                    } else {
                      revokeConsent();
                    }
                  }}
                  value={isConsentGranted ?? false}
                />
              </Field>
              <div>
                <Field label="Ask questions and share your feedback, feature requests, and bug reports:">
                  <Button
                    align="left"
                    color="secondary"
                    element="a"
                    htmlProps={{
                      className: 'w-full',
                      href: import.meta.env.VITE_DISCORD_INVITE_URL,
                      target: '_blank',
                    }}
                    icon={<QuestionAnswerOutlined />}
                    label="Discord"
                  />
                </Field>
              </div>
              <DeleteAccount />
            </>
          )}
          {section === 'install' && (
            <>
              <NativeSetup />
              <AddToDesktop />
            </>
          )}
          {section === 'appearance' && (
            <>
              <Field label="Theme">
                <ButtonSelect<ThemeModePreference>
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
              {user?.activeSubscription && (
                <Field label="Theme color">
                  <ThemeColorSelect
                    onChange={(value) => {
                      setPrimaryColor(value);
                    }}
                    value={primaryColor}
                  />
                </Field>
              )}
            </>
          )}
          {section === 'subscription' && <Subscription close={close} />}
          {section === 'usage' && <Usage />}
        </div>
      )}
      {isMobile && <AboutLinks />}
    </div>
  );
};
