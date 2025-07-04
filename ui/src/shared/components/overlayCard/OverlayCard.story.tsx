import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import { OverlayCard } from './OverlayCard';

export const OverlayCardStory: React.FC<StoryProps> = ({ testApp }) => (
  <TestApp {...testApp}>
    <div className="flex h-screen items-center justify-center">
      <OverlayCard isOpen>
        {() => (
          <>
            <div>Content</div>
            <Input />
            <Button label="Close" />
          </>
        )}
      </OverlayCard>
    </div>
  </TestApp>
);
