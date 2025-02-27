import React from 'react';
import { ButtonSelect } from '~/shared/components/buttonSelect/ButtonSelect';
import { Field } from '~/shared/components/field/Field';
import type { ThemeModePreference } from '../theme/types';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeContext } from '../theme/Context';
import { AddToDesktop } from './addToDesktop/AddToDesktop';
import { AiContext } from '../ai/Context';
import { Input } from '~/shared/components/input/Input';

export const Settings: React.FC = () => {
  const { modePreference, setModePreference } = useDefinedContext(ThemeContext);
  const { openAiApiKey, setOpenAiApiKey, anthropicApiKey, setAnthropicApiKey } =
    useDefinedContext(AiContext);

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
      <Field label="OpenAI API Key">
        <Input
          onChange={(value) => setOpenAiApiKey(value)}
          htmlProps={{ type: 'password', value: openAiApiKey }}
        />
      </Field>
      <Field label="Anthropic API Key">
        <Input
          onChange={(value) => setAnthropicApiKey(value)}
          htmlProps={{ type: 'password', value: anthropicApiKey }}
        />
      </Field>
      <AddToDesktop />
    </div>
  );
};
