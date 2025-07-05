import React from 'react';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import { OverlayCard } from './OverlayCard';
import { useOverlay } from '../overlay/useOverlay';

export const OverlayCardStoryInner: React.FC = () => {
  const overlay = useOverlay({
    isOpen: true,
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <OverlayCard overlay={overlay}>
        {() => (
          <>
            <div>Content</div>
            <Input />
            <Button label="Close" />
          </>
        )}
      </OverlayCard>
    </div>
  );
};

export const OverlayCardStory: React.FC<StoryProps> = ({ testApp }) => {
  return (
    <TestApp {...testApp}>
      <OverlayCardStoryInner />
    </TestApp>
  );
};
