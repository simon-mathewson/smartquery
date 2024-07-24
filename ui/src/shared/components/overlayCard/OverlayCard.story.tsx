import React, { useRef } from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import type { OverlayCardProps } from './OverlayCard';
import { OverlayCard } from './OverlayCard';

export type OverlayCardStoryProps = {
  anchor?: boolean;
  overlayCard?: Partial<OverlayCardProps>;
  trigger?: Extract<ButtonProps, { element?: 'button' }> | true;
};

export const OverlayCardStory: React.FC<OverlayCardStoryProps> = (props) => {
  const { anchor, overlayCard, trigger } = props;

  const anchorRef = useRef<HTMLDivElement>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const triggerProps = trigger === true ? {} : trigger;

  return (
    <div className="flex h-screen items-center justify-center">
      {triggerProps && (
        <Button
          {...triggerProps}
          htmlProps={{ ...triggerProps?.htmlProps, ref: triggerRef }}
          label="Open"
        />
      )}
      {anchor && <div className="fixed left-0 top-0 h-4 w-4 bg-red-500" ref={anchorRef} />}
      <OverlayCard
        {...overlayCard}
        anchorRef={anchor ? anchorRef : undefined}
        htmlProps={overlayCard?.htmlProps}
        triggerRef={trigger ? triggerRef : undefined}
      >
        {({ close }) => (
          <>
            <div>Content</div>
            <Input />
            <Button htmlProps={{ onClick: close }} label="Close" />
          </>
        )}
      </OverlayCard>
    </div>
  );
};
