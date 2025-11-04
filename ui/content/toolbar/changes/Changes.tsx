import { ArrowForward, DeleteOutline } from '@mui/icons-material';
import React from 'react';
import { EditContext } from '~/content/edit/Context';
import { Button } from '~/shared/components/button/Button';
import { ConfirmDeletePopover } from '~/shared/components/confirmDeletePopover/ConfirmDeletePopover';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ReviewChangesCard } from './reviewChangesCard/ReviewChangesCard';
import { AnalyticsContext } from '~/content/analytics/Context';
import { useOverlay } from '~/shared/components/overlay/useOverlay';

export const Changes: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { allChanges, clearChanges } = useDefinedContext(EditContext);

  const changeCount = allChanges.length;

  const reviewChangesCardOverlay = useOverlay({
    align: 'right',
    onOpen: () => track('toolbar_changes_review'),
  });

  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">
      <div className="text-sm">
        {changeCount} change{changeCount > 1 ? 's' : ''}
      </div>
      <ConfirmDeletePopover
        onConfirm={() => {
          clearChanges();
          track('toolbar_changes_clear');
        }}
        renderTrigger={(htmlProps) => (
          <Button color="danger" htmlProps={htmlProps} icon={<DeleteOutline />} />
        )}
        text={`Delete ${changeCount} change${changeCount > 1 ? 's' : ''}`}
      />
      <Button
        htmlProps={reviewChangesCardOverlay.triggerProps}
        icon={<ArrowForward />}
        label="Review & Submit"
        variant="filled"
      />
      <ReviewChangesCard overlay={reviewChangesCardOverlay} />
    </div>
  );
};
