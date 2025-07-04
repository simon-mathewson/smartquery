import React, { useRef } from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import type { OverlayProps } from './Overlay';
import { Overlay } from './Overlay';
import { TestApp } from '~/test/componentTests/TestApp';
import type { StoryProps } from '~/test/componentTests/StoryProps';

export type OverlayStoryProps = StoryProps<Omit<OverlayProps, 'children'>> & {
  anchor?: boolean;
  trigger?: Extract<ButtonProps, { element?: 'button' }> | true;
};

export const OverlayStory: React.FC<OverlayStoryProps> = ({
  anchor,
  componentProps,
  testApp,
  trigger,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const triggerProps = trigger === true ? {} : trigger;

  return (
    <TestApp {...testApp}>
      <div className="flex h-screen items-center justify-center">
        {triggerProps && (
          <Button
            {...triggerProps}
            htmlProps={{ ...triggerProps?.htmlProps, ref: triggerRef }}
            label="Open"
          />
        )}
        {anchor && <div className="fixed left-0 top-0 h-4 w-4 bg-red-500" ref={anchorRef} />}
        <Overlay
          {...componentProps}
          anchorRef={anchor ? anchorRef : undefined}
          htmlProps={componentProps?.htmlProps}
          triggerRef={trigger ? triggerRef : undefined}
        >
          {({ control, root }) => (
            <div {...root.htmlProps}>
              <div>Content</div>
              <Input />
              <Button htmlProps={{ onClick: control.close }} label="Close" />
            </div>
          )}
        </Overlay>
      </div>
    </TestApp>
  );
};
