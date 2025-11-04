import { range } from 'lodash';
import { useMemo } from 'react';
import type { OverlayControl } from '~/shared/components/overlay/useOverlay';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays/arrays';
import { getUniqueValues } from '../../../utils/getUniqueValues';
import { ResultContext } from '../../Context';
import type { EditOverlayFieldProps } from './field/Field';
import { EditOverlayField } from './field/Field';

export type EditModalProps = {
  columnCount: number;
  overlay: OverlayControl;
  selection: number[][];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditOverlay: React.FC<EditModalProps> = (props) => {
  const { columnCount, overlay, selection } = props;

  const { columns, rows, tables } = useDefinedContext(ResultContext);

  const columnFields = useMemo(() => {
    return selection.reduce<Array<Pick<EditOverlayFieldProps, 'column' | 'locations'>>>(
      (allColumnsWithValues, _selectedColumnIndices, rowIndex) => {
        const newColumnsWithValues = cloneArrayWithEmptyValues(allColumnsWithValues);

        const selectedColumnIndices =
          _selectedColumnIndices.length === 0 ? range(columnCount) : _selectedColumnIndices;

        selectedColumnIndices.forEach((columnIndex) => {
          const column = columns![columnIndex];

          if (column.isVirtual) return;

          if (!newColumnsWithValues[columnIndex]) {
            newColumnsWithValues[columnIndex] = { column, locations: [] };
          }

          if (rows[rowIndex]) {
            const value = rows[rowIndex][columnIndex];

            newColumnsWithValues[columnIndex].locations.push({
              column: column.originalName,
              originalValue: value,
              uniqueValues: getUniqueValues(columns!, rows[rowIndex])!,
              table: tables[0].originalName,
              type: 'update',
            });
          } else {
            newColumnsWithValues[columnIndex].locations.push({
              index: rowIndex - rows.length,
              table: tables[0].originalName,
              type: 'create',
            });
          }
        });
        return newColumnsWithValues;
      },
      [],
    );
  }, [columnCount, columns, rows, selection, tables]);

  if (selection.length === 0) return null;

  return (
    <OverlayCard htmlProps={{ className: 'p-3' }} overlay={overlay}>
      {() => (
        <div className="no-scrollbar grid w-full min-w-[320px] max-w-[360px] gap-2">
          {columnFields?.map((fieldProps, index) => (
            <EditOverlayField
              autoFocus={index === columnFields.findIndex((c) => c)}
              key={
                fieldProps.column.table
                  ? `${fieldProps.column.table}.${fieldProps.column.name}`
                  : fieldProps.column.name
              }
              {...fieldProps}
            />
          ))}
        </div>
      )}
    </OverlayCard>
  );
};
