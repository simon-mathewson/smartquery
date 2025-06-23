import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { DatabaseList } from './DatabaseList';

export const DatabaseListStory: React.FC<StoryProps> = (props) => {
  const { testApp } = props;

  return (
    <TestApp {...testApp}>
      <DatabaseList />
    </TestApp>
  );
};
