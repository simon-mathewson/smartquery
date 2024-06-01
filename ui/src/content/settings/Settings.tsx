import React from 'react';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Field } from '~/shared/components/Field/Field';
import type { ThemeModePreference } from '../theme/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ThemeContext } from '../theme/Context';
import { AddToDesktop } from './addToDesktop/AddToDesktop';

export const Settings: React.FC = () => {
  const { modePreference, setModePreference } = useDefinedContext(ThemeContext);

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap pt-1 text-center text-sm font-medium text-textPrimary">
        Settings
      </div>
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
      <AddToDesktop />
    </div>
  );
};
