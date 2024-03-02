import { range } from 'lodash';
import { useMemo } from 'react';
import type { Query } from '~/shared/types';
import { getPrimaryKeys } from '~/content/tabs/Queries/utils';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays';
import type { ColumnFieldProps } from './ColumnField/ColumnField';
import { ColumnField } from './ColumnField/ColumnField';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '~/content/tabs/Context';

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

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const columnFields = useMemo(() => {
    if (!queryResult) return null;

    return selection.reduce<Array<Pick<ColumnFieldProps, 'column' | 'rows'>>>(
      (allColumnsWithValues, _selectedColumnIndices, rowIndex) => {
        const newColumnsWithValues = cloneArrayWithEmptyValues(allColumnsWithValues);

        const selectedColumnIndices =
          _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

        selectedColumnIndices.forEach((columnIndex) => {
          const column = queryResult.columns![columnIndex];
          const value = queryResult.rows[rowIndex][column.name];

          if (!newColumnsWithValues[columnIndex]) {
            newColumnsWithValues[columnIndex] = { column, rows: [] };
          }

          newColumnsWithValues[columnIndex].rows.push({
            primaryKeys: getPrimaryKeys(queryResult.columns!, queryResult.rows, rowIndex),
            value,
          });
        });
        return newColumnsWithValues;
      },
      [],
    );
  }, [columnCount, queryResult, selection]);

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
