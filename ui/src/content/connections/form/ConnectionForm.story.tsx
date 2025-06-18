import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import type { ConnectionFormProps } from './ConnectionForm';
import { ConnectionForm } from './ConnectionForm';

export const ConnectionFormStory: React.FC<StoryProps<ConnectionFormProps>> = ({
  props,
  providers,
}) => (
  <TestApp providerOverrides={providers}>
    <ConnectionForm {...props} />
  </TestApp>
);
