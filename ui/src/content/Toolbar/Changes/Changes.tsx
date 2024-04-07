import { ArrowForward, DeleteOutline } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { Button } from '~/shared/components/Button/Button';
import { ConfirmDeletePopover } from '~/shared/components/ConfirmDeletePopover/ConfirmDeletePopover';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ReviewChangesCard } from './ReviewChangesCard/ReviewChangesCard';

export const Changes: React.FC = () => {
  const { allChanges, clearChanges } = useDefinedContext(EditContext);

  const changeCount = allChanges.length;

  if (!changeCount) return null;

  const reviewChangesCardTriggerRef = React.createRef<HTMLButtonElement>();

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      <div className="text-sm">
        {changeCount} change{changeCount > 1 ? 's' : ''}
      </div>
      <ConfirmDeletePopover
        onConfirm={clearChanges}
        renderTrigger={({ ref }) => <Button color="danger" icon={<DeleteOutline />} ref={ref} />}
        text={`Delete ${changeCount} change${changeCount > 1 ? 's' : ''}`}
      />
      <Button
        icon={<ArrowForward />}
        label="Review & Submit"
        ref={reviewChangesCardTriggerRef}
        variant="filled"
      />
      <ReviewChangesCard triggerRef={reviewChangesCardTriggerRef} />
    </div>
  );
};
