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
  const {
    googleAiApiKey,
    openAiApiKey,
    setGoogleAiApiKey,
    setOpenAiApiKey,
    aiProvider,
    setAiProvider,
  } = useDefinedContext(AiContext);

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
      <Field label="AI Provider">
        <ButtonSelect<typeof aiProvider>
          equalWidth
          fullWidth
          onChange={(value) => setAiProvider(value)}
          options={[
            { button: { label: 'Google' }, value: 'google' },
            { button: { label: 'OpenAI' }, value: 'openai' },
          ]}
          value={aiProvider}
        />
      </Field>
      {aiProvider && (
        <Field label={aiProvider === 'openai' ? 'OpenAI API Key' : 'Google AI API Key'}>
          <Input
            onChange={(value) => {
              if (aiProvider === 'openai') {
                setOpenAiApiKey(value);
              } else {
                setGoogleAiApiKey(value);
              }
            }}
            htmlProps={{
              type: 'password',
              value: aiProvider === 'openai' ? openAiApiKey : googleAiApiKey,
            }}
          />
        </Field>
      )}
      <AddToDesktop />
    </div>
  );
};
