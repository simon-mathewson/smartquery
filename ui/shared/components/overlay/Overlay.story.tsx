import React, { useRef } from 'react';
import type { ButtonProps } from '../button/Button';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import type { OverlayProps } from './Overlay';
import { Overlay } from './Overlay';
import { TestApp } from '~/test/componentTests/TestApp';
import type { StoryProps } from '~/test/componentTests/StoryProps';
import type { UseOverlayProps } from './useOverlay';
import { useOverlay } from './useOverlay';

export type OverlayStoryProps = StoryProps<
  Omit<OverlayProps, 'children' | 'overlay'> & UseOverlayProps
> & {
  anchor?: boolean;
  trigger?: Extract<ButtonProps, { element?: 'button' }> | true;
};

export const OverlayStoryInner: React.FC<OverlayStoryProps> = ({
  anchor,
  componentProps: { htmlProps, ...useOverlayProps },
  trigger,
}) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const triggerProps = trigger === true ? {} : trigger;

  const overlay = useOverlay({
    ...useOverlayProps,
    anchorRef: anchor ? anchorRef : undefined,
    triggerRef: trigger ? triggerRef : undefined,
  });

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
      <Overlay htmlProps={htmlProps} overlay={overlay}>
        {({ control, root }) => (
          <div {...root.htmlProps}>
            <div>Content</div>
            <Input />
            <Button htmlProps={{ onClick: control.close }} label="Close" />
          </div>
        )}
      </Overlay>
    </div>
  );
};

export const OverlayStory: React.FC<OverlayStoryProps> = (props) => (
  <TestApp {...props.testApp}>
    <OverlayStoryInner {...props} />
  </TestApp>
);
