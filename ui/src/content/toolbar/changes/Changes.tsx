import { ArrowForward, DeleteOutline } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { Button } from '~/shared/components/button/Button';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ReviewChangesCard } from './reviewChangesCard/ReviewChangesCard';

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
        renderTrigger={(htmlProps) => (
          <Button color="danger" htmlProps={htmlProps} icon={<DeleteOutline />} />
        )}
        text={`Delete ${changeCount} change${changeCount > 1 ? 's' : ''}`}
      />
      <Button
        htmlProps={{ ref: reviewChangesCardTriggerRef }}
        icon={<ArrowForward />}
        label="Review & Submit"
        variant="filled"
      />
      <ReviewChangesCard triggerRef={reviewChangesCardTriggerRef} />
    </div>
  );
};
