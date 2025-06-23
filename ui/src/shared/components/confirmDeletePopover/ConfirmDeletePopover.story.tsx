import { TestApp } from '~/test/componentTests/TestApp';
import { Button } from '../button/Button';
import type { ConfirmDeletePopoverProps } from './ConfirmDeletePopover';
import { ConfirmDeletePopover } from './ConfirmDeletePopover';
import type { StoryProps } from '~/test/componentTests/StoryProps';

export type ConfirmDeletePopoverStoryProps = StoryProps<
  Omit<ConfirmDeletePopoverProps, 'renderTrigger'>
>;

export const ConfirmDeletePopoverStory: React.FC<ConfirmDeletePopoverStoryProps> = ({
  componentProps,
  testApp,
}) => (
  <TestApp {...testApp}>
    <ConfirmDeletePopover
      {...componentProps}
      renderTrigger={(triggerProps) => <Button htmlProps={triggerProps} label="Delete" />}
    />
  </TestApp>
);
