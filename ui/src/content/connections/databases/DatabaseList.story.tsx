import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { DatabaseList } from './DatabaseList';

export const DatabaseListStory: React.FC<StoryProps> = (props) => {
  const { providers } = props;

  return (
    <TestApp providerOverrides={providers}>
      <DatabaseList />
    </TestApp>
  );
};
