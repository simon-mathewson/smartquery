import { useEffect, useMemo, useState } from 'react';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { Query } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';

export type EditModalProps = {
  editButtonRef: React.MutableRefObject<HTMLElement | null>;
  query: Query;
  selection: number[][];
  selectionActionsPopoverRef: React.MutableRefObject<HTMLElement | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditOverlay: React.FC<EditModalProps> = (props) => {
  const { query, editButtonRef, selection, selectionActionsPopoverRef, setIsEditing } = props;

  const { initialValues, selectedColumns } = useMemo(() => {
    const selectedRowIndex = selection.findIndex((row) => row);
    if (selectedRowIndex === -1) return {};

    const selectedColumnIndices = selection[selectedRowIndex];
    const selectedRow = query.rows[selectedRowIndex];
    const selectedColumns = query.columns.filter(
      (_, index) => selectedColumnIndices.length === 0 || selectedColumnIndices.includes(index),
    );

    const initialValues = selectedColumns.reduce(
      (acc, column) => ({ ...acc, [column]: selectedRow[column] }),
      {},
    );

    return { initialValues, selectedColumns };
  }, [query, selection]);

  const [formValues, setFormValues] = useState<{ [key: string]: string }>(initialValues ?? {});

  useEffect(() => {
    setFormValues(initialValues ?? {});
  }, [initialValues]);

  if (selection.length === 0) return null;

  return (
    <OverlayCard
      align="center"
      anchorRef={selectionActionsPopoverRef}
      onClose={() => setIsEditing(false)}
      onOpen={() => setIsEditing(true)}
      triggerRef={editButtonRef}
    >
      {() => (
        <div className="w-full min-w-[280px] max-w-[360px] overflow-auto p-4">
          <div className="grid gap-2 overflow-auto">
            {selectedColumns?.map((column) => (
              <Input
                key={column}
                label={column}
                value={formValues[column] ?? ''}
                onChange={(newValue) => setFormValues({ ...formValues, [column]: newValue })}
              />
            ))}
          </div>
        </div>
      )}
    </OverlayCard>
  );
};
