import React, { useRef } from 'react';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import type { OverlayCardProps } from './OverlayCard';
import { OverlayCard } from './OverlayCard';

export type OverlayCardStoryProps = Partial<OverlayCardProps>;

export const OverlayCardStory: React.FC<OverlayCardStoryProps> = (props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button htmlProps={{ ref: triggerRef }} label="Open" />
      <OverlayCard
        htmlProps={{ ...props.htmlProps, className: 'w-[200px]' }}
        triggerRef={triggerRef}
        {...props}
      >
        {({ close }) => (
          <>
            <div>Content</div>
            <Input />
            <Button htmlProps={{ onClick: close }} label="Close" />
          </>
        )}
      </OverlayCard>
    </>
  );
};
