import { Button } from '../button/Button';
import type { ConfirmDeletePopoverProps } from './ConfirmDeletePopover';
import { ConfirmDeletePopover } from './ConfirmDeletePopover';

export const ConfirmDeletePopoverStory = (
  props: Omit<ConfirmDeletePopoverProps, 'renderTrigger'>,
) => (
  <ConfirmDeletePopover
    {...props}
    renderTrigger={(triggerProps) => <Button label="Delete" {...triggerProps} />}
  />
);
