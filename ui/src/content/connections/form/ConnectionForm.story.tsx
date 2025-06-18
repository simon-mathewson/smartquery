import React from 'react';
import { TestApp } from '~/test/componentTests/TestApp';
import type { ConnectionFormProps } from './ConnectionForm';
import { ConnectionForm } from './ConnectionForm';
import { Card } from '~/shared/components/card/Card';
import type { StoryProps } from '~/test/componentTests/StoryProps';

export const ConnectionFormStory: React.FC<StoryProps<ConnectionFormProps>> = (props) => {
  const { propsOverrides, providerOverrides } = props;

  return (
    <TestApp providerOverrides={providerOverrides}>
      <Card htmlProps={{ className: 'w-max' }}>
        <ConnectionForm exit={() => {}} {...propsOverrides} />
      </Card>
    </TestApp>
  );
};
