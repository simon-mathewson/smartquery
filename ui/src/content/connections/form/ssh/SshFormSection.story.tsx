import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { SshFormSection, type SshFormSectionProps } from './SshFormSection';

export const SshFormSectionStory: React.FC<StoryProps<SshFormSectionProps>> = ({
  componentProps,
  testApp,
}) => (
  <TestApp providerOverrides={testApp?.providerOverrides}>
    <SshFormSection {...componentProps} />
  </TestApp>
);
