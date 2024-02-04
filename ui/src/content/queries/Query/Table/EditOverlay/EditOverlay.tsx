import { range } from 'lodash';
import { useMemo } from 'react';
import { EditContext } from '~/content/edit/Context';
import { PrimaryKey } from '~/content/edit/types';
import { Column, Query, Value } from '~/content/queries/types';
import { Input } from '~/shared/components/Input/Input';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays';

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

  const { changes, handleChange } = useDefinedContext(EditContext);

  const columnsWithValues = useMemo(() => {
    return selection.reduce<
      Array<{ column: Column; rows: Array<{ primaryKeys: PrimaryKey[]; value: Value }> }>
    >((allColumnsWithValues, _selectedColumnIndices, rowIndex) => {
      const newColumnsWithValues = cloneArrayWithEmptyValues(allColumnsWithValues);

      const selectedColumnIndices =
        _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

      selectedColumnIndices.forEach((columnIndex) => {
        const column = query.columns[columnIndex];
        const value = query.rows[rowIndex][column.name];

        if (!newColumnsWithValues[columnIndex]) {
          newColumnsWithValues[columnIndex] = { column, rows: [] };
        }

        const primaryKeys = query.columns
          .filter((column) => column.isPrimaryKey)
          .map((column) => ({
            column: column.name,
            value: query.rows[rowIndex][column.name] as string | number,
          }));

        newColumnsWithValues[columnIndex].rows.push({ primaryKeys, value });
      });
      return newColumnsWithValues;
    }, []);
  }, [columnCount, query.columns, query.rows, selection]);

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
            {columnsWithValues?.map(({ column, rows }) => {
              const originalValues = rows.map(({ value }) => value);
              const changedValues = changes
                .filter(
                  (change) =>
                    change.column === column.name &&
                    change.table === query.table &&
                    change.rows.some((row) =>
                      row.primaryKeys.every((key, index) =>
                        rows.some(
                          (row) =>
                            row.primaryKeys[index].column === key.column &&
                            row.primaryKeys[index].value === key.value,
                        ),
                      ),
                    ),
                )
                .map((change) => change.value);

              const values = changedValues.length > 0 ? changedValues : originalValues;
              const allValuesAreEqual = values.every((value) => value === values[0]);
              const valueString = allValuesAreEqual ? String(values[0]) || '' : '';

              return (
                <Input
                  key={column.name}
                  label={column.name}
                  placeholder={!allValuesAreEqual ? 'Multiple values' : undefined}
                  value={valueString}
                  onChange={(newValue) =>
                    handleChange(
                      {
                        column: column.name,
                        rows,
                        table: query.table!,
                        value: newValue,
                      },
                      rows,
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </OverlayCard>
  );
};
