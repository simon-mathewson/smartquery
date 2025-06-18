import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { DatabaseList } from './List';

export const DatabaseListStory: React.FC<StoryProps> = (props) => {
  const { providerOverrides } = props;

  return (
    <TestApp providerOverrides={providerOverrides}>
      <DatabaseList />
    </TestApp>
  );
};
