import { range } from 'lodash';
import { useMemo } from 'react';
import { getPrimaryKeys } from '~/content/tabs/Queries/utils';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays';
import type { ColumnFieldProps } from './ColumnField/ColumnField';
import { ColumnField } from './ColumnField/ColumnField';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueryContext, ResultContext } from '../../Context';

export type EditModalProps = {
  columnCount: number;
  editButtonRef: React.MutableRefObject<HTMLElement | null>;
  selection: number[][];
  selectionActionsPopoverRef: React.MutableRefObject<HTMLElement | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditOverlay: React.FC<EditModalProps> = (props) => {
  const { columnCount, editButtonRef, selection, selectionActionsPopoverRef, setIsEditing } = props;

  const { query } = useDefinedContext(QueryContext);

  const { columns, rows } = useDefinedContext(ResultContext);

  const columnFields = useMemo(() => {
    return selection.reduce<Array<Pick<ColumnFieldProps, 'column' | 'locations'>>>(
      (allColumnsWithValues, _selectedColumnIndices, rowIndex) => {
        const newColumnsWithValues = cloneArrayWithEmptyValues(allColumnsWithValues);

        const selectedColumnIndices =
          _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

        selectedColumnIndices.forEach((columnIndex) => {
          const column = columns![columnIndex];

          if (!newColumnsWithValues[columnIndex]) {
            newColumnsWithValues[columnIndex] = { column, locations: [] };
          }

          if (rows[rowIndex]) {
            const value = rows[rowIndex][column.alias ?? column.name];

            newColumnsWithValues[columnIndex].locations.push({
              column: column.name,
              originalValue: value,
              primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
              table: query.table!,
              type: 'update',
            });
          } else {
            newColumnsWithValues[columnIndex].locations.push({
              newRowId: String(rowIndex - rows.length),
              table: query.table!,
              type: 'create',
            });
          }
        });
        return newColumnsWithValues;
      },
      [],
    );
  }, [columnCount, columns, query.table, rows, selection]);

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
                key={fieldProps.column.alias ?? fieldProps.column.name}
                {...fieldProps}
              />
            ))}
          </div>
        </div>
      )}
    </OverlayCard>
  );
};
