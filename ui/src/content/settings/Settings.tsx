import {
  ArrowBackOutlined,
  BrushOutlined,
  LogoutOutlined,
  PersonAddAlt1Outlined,
  QuestionAnswerOutlined,
  ReplayOutlined,
  SettingsEthernetOutlined,
  SettingsOutlined,
  SpeedOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import React, { useState } from 'react';
import { assert } from 'ts-essentials';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import { Header } from '~/shared/components/header/Header';
import { List } from '~/shared/components/list/List';
import { ThemeColorSelect } from '~/shared/components/themeColorSelect/ThemeColorSelect';
import { Toggle } from '~/shared/components/toggle/Toggle';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { AnalyticsContext } from '../analytics/Context';
import { AuthContext } from '../auth/Context';
import { ConnectionsContext } from '../connections/Context';
import { ErrorTrackingContext } from '../errors/tracking/Context';
import { LinkSetup } from '../link/setup/Setup';
import { ThemeContext } from '../theme/Context';
import type { ThemeModePreference } from '../theme/types';
import { AddToDesktop } from './addToDesktop/AddToDesktop';
import { Usage } from './usage/Usage';
import { Subscription } from './Subscription';

export type SettingsProps = {
  close: () => Promise<void>;
};

const sections = [
  'home',
  'general',
  'connectivity',
  'appearance',
  'usage',
  'subscription',
] as const;
type Section = (typeof sections)[number];

const labels: Record<Section, string> = {
  appearance: 'Appearance',
  connectivity: 'Connectivity',
  general: 'General',
  home: 'Settings',
  subscription: 'Subscription',
  usage: 'Usage',
} as const;

export const Settings: React.FC<SettingsProps> = ({ close }) => {
  const { isConsentGranted, setIsConsentGranted } = useDefinedContext(ErrorTrackingContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const { logOut, user } = useDefinedContext(AuthContext);
  const { modePreference, setModePreference, primaryColor, setPrimaryColor } =
    useDefinedContext(ThemeContext);
  const { connectViaCloud, setConnectViaCloud } = useDefinedContext(ConnectionsContext);

  const [section, setSection] = useState<Section>('home');

  return (
    <div className="flex flex-col gap-2">
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
            {
              icon: <SettingsEthernetOutlined />,
              label: labels.connectivity,
              value: 'connectivity',
            },
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
      {section === 'general' && (
        <>
          <Field>
            <Toggle
              hint="Help improve Dabase"
              label="Share anonymous usage data"
              onChange={(value) => setIsConsentGranted(Boolean(value))}
              value={isConsentGranted ?? false}
            />
          </Field>
          <AddToDesktop />
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
        </>
      )}
      {section === 'connectivity' && (
        <>
          <LinkSetup />
          <Field>
            <Toggle
              hint="Use Dabase servers for remote connections. Local connections still require Dabase Link."
              label="Connect via Cloud"
              onChange={(value) => setConnectViaCloud(value)}
              value={connectViaCloud ?? false}
            />
          </Field>
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
  );
};
