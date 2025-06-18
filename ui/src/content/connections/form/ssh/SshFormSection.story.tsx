import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { SshFormSection, type SshFormSectionProps } from './SshFormSection';
import { getProps } from './mocks';

export const SshFormSectionStory: React.FC<StoryProps<SshFormSectionProps>> = (props) => {
  const { propsOverrides, providerOverrides } = props;

  return (
    <TestApp providerOverrides={providerOverrides}>
      <SshFormSection {...getProps()} {...propsOverrides} />
    </TestApp>
  );
};
