import { ArrowForward, DeleteOutline } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { Button } from '~/shared/components/Button/Button';
import { ConfirmDeletePopover } from '~/shared/components/ConfirmDeletePopover/ConfirmDeletePopover';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ReviewChangesCard } from './ReviewChangesCard/ReviewChangesCard';

export const Changes: React.FC = () => {
  const { changes, clearChanges } = useDefinedContext(EditContext);

  if (!changes.length) return null;

  const reviewChangesCardTriggerRef = React.createRef<HTMLButtonElement>();

  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="text-sm text-gray-500">
        {changes.length} pending change{changes.length > 1 ? 's' : ''}
      </div>
      <ConfirmDeletePopover
        onConfirm={clearChanges}
        renderTrigger={({ ref }) => <Button icon={<DeleteOutline />} ref={ref} variant="danger" />}
        text={`Delete ${changes.length} pending change${changes.length > 1 ? 's' : ''}`}
      />
      <Button
        icon={<ArrowForward />}
        label="Review & Submit"
        ref={reviewChangesCardTriggerRef}
        variant="primary"
      />
      <ReviewChangesCard triggerRef={reviewChangesCardTriggerRef} />
    </div>
  );
};
