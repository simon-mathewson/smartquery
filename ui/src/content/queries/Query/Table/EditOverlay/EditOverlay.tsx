import { range } from 'lodash';
import { useMemo } from 'react';
import { Query } from '~/content/queries/types';
import { getPrimaryKeys } from '~/content/queries/utils';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays';
import { ColumnField, ColumnFieldProps } from './ColumnField/ColumnField';

export type EditModalProps = {
  columnCount: number;
  editButtonRef: React.MutableRefObject<HTMLElement | null>;
  query: Query;
  selection: number[][];
  selectionActionsPopoverRef: React.MutableRefObject<HTMLElement | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditOverlay: React.FC<EditModalProps> = (props) => {
  const { columnCount, query, editButtonRef, selection, selectionActionsPopoverRef, setIsEditing } =
    props;

  const columnFields = useMemo(() => {
    return selection.reduce<Array<Pick<ColumnFieldProps, 'column' | 'rows'>>>(
      (allColumnsWithValues, _selectedColumnIndices, rowIndex) => {
        const newColumnsWithValues = cloneArrayWithEmptyValues(allColumnsWithValues);

        const selectedColumnIndices =
          _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

        selectedColumnIndices.forEach((columnIndex) => {
          const column = query.columns[columnIndex];
          const value = query.rows[rowIndex][column.name];

          if (!newColumnsWithValues[columnIndex]) {
            newColumnsWithValues[columnIndex] = { column, rows: [] };
          }

          newColumnsWithValues[columnIndex].rows.push({
            primaryKeys: getPrimaryKeys(query, rowIndex),
            value,
          });
        });
        return newColumnsWithValues;
      },
      [],
    );
  }, [columnCount, query, selection]);

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
        <div className="w-full min-w-[320px] max-w-[360px] overflow-auto p-4">
          <div className="grid gap-2 overflow-auto">
            {columnFields?.map((fieldProps, index) => (
              <ColumnField
                autoFocus={index === columnFields.findIndex((c) => c)}
                key={fieldProps.column.name}
                query={query}
                {...fieldProps}
              />
            ))}
          </div>
        </div>
      )}
    </OverlayCard>
  );
};
