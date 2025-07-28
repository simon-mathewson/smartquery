import { range } from 'lodash';
import { useMemo } from 'react';
import { OverlayCard } from '~/shared/components/overlayCard/OverlayCard';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays/arrays';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../../Context';
import type { EditOverlayFieldProps } from './field/Field';
import { EditOverlayField } from './field/Field';
import { getPrimaryKeys } from '../../../utils/primaryKeys';
import { useOverlay } from '~/shared/components/overlay/useOverlay';

export type EditModalProps = {
  columnCount: number;
  editButtonRef: React.MutableRefObject<HTMLElement | null>;
  selection: number[][];
  selectionActionsPopoverRef: React.MutableRefObject<HTMLElement | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditOverlay: React.FC<EditModalProps> = (props) => {
  const { columnCount, editButtonRef, selection, selectionActionsPopoverRef, setIsEditing } = props;

  const { columns, rows, table } = useDefinedContext(ResultContext);

  const columnFields = useMemo(() => {
    return selection.reduce<Array<Pick<EditOverlayFieldProps, 'column' | 'locations'>>>(
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
            const value = rows[rowIndex][column.name];

            newColumnsWithValues[columnIndex].locations.push({
              column: column.name,
              originalValue: value,
              primaryKeys: getPrimaryKeys(columns!, rows, rowIndex)!,
              table: table!,
              type: 'update',
            });
          } else {
            newColumnsWithValues[columnIndex].locations.push({
              index: rowIndex - rows.length,
              table: table!,
              type: 'create',
            });
          }
        });
        return newColumnsWithValues;
      },
      [],
    );
  }, [columnCount, columns, rows, selection, table]);

  const overlay = useOverlay({
    align: 'center',
    anchorRef: selectionActionsPopoverRef,
    onClose: () => setIsEditing(false),
    onOpen: () => setIsEditing(true),
    triggerRef: editButtonRef,
  });

  if (selection.length === 0) return null;

  return (
    <OverlayCard htmlProps={{ className: 'p-3 overflow-auto' }} overlay={overlay}>
      {() => (
        <div className="no-scrollbar grid w-full min-w-[320px] max-w-[360px] gap-2">
          {columnFields?.map((fieldProps, index) => (
            <EditOverlayField
              autoFocus={index === columnFields.findIndex((c) => c)}
              key={fieldProps.column.name}
              {...fieldProps}
            />
          ))}
        </div>
      )}
    </OverlayCard>
  );
};
