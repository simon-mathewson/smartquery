import { useCallback, useMemo, useRef, useState } from 'react';
import { useEscape } from '~/shared/hooks/useEscape/useEscape';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { cloneArrayWithEmptyValues } from '~/shared/utils/arrays/arrays';
import { ResultContext } from '../Context';
import { AnalyticsContext } from '~/content/analytics/Context';

export const useSelection = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { columns } = useDefinedContext(ResultContext);

  const [selection, setSelection] = useState<number[][]>([]);

  const tableContentRef = useRef<HTMLDivElement | null>(null);

  const selectionActionsRef = useRef<HTMLDivElement | null>(null);

  useEscape({
    active: selection.length > 0,
    clickOutside: {
      additionalRefs: useMemo(() => [selectionActionsRef], []),
      ref: tableContentRef,
    },
    handler: () => {
      setSelection([]);
      lastSelectedCellIndicesRef.current = [];
    },
  });

  const lastClickRef = useRef<{ columnIndex: number; rowIndex: number; timestamp: number }>();
  const isDoubleClick = (row: number, column: number) =>
    lastClickRef.current !== undefined &&
    lastClickRef.current.columnIndex === column &&
    lastClickRef.current.rowIndex === row &&
    Date.now() - lastClickRef.current.timestamp < 300;

  const lastSelectedCellIndicesRef = useRef<[number, number?][]>([]);

  const handleCellDoubleClick = useCallback(
    (rowIndex: number, addSelection: boolean, addConsecutive: boolean) => {
      const newRowSelections =
        addSelection || addConsecutive ? cloneArrayWithEmptyValues(selection) : [];

      lastSelectedCellIndicesRef.current.pop();
      const lastSelectedCellIndices = lastSelectedCellIndicesRef.current.slice(-1).at(0);

      if (addConsecutive && lastSelectedCellIndices) {
        const lastSelectedRowIndex = lastSelectedCellIndices[0];

        const start = Math.min(lastSelectedRowIndex, rowIndex);
        const end = Math.max(lastSelectedRowIndex, rowIndex);

        for (let i = start; i <= end; i++) {
          newRowSelections[i] = [];
        }
      } else {
        newRowSelections[rowIndex] = [];
      }

      lastSelectedCellIndicesRef.current.push([rowIndex]);

      setSelection(newRowSelections);

      track('table_cell_double_click');
    },
    [selection, track],
  );

  const handleCellClick = useCallback(
    async (event: React.MouseEvent, rowIndex: number, columnIndex: number) => {
      const addSelection = event.ctrlKey || event.metaKey;
      const addConsecutive = event.shiftKey;

      if (isDoubleClick(rowIndex, columnIndex)) {
        handleCellDoubleClick(rowIndex, addSelection, addConsecutive);
        return;
      }

      lastClickRef.current = { columnIndex, rowIndex, timestamp: Date.now() };

      const newRowSelections =
        addSelection || addConsecutive ? cloneArrayWithEmptyValues(selection) : [];

      const shouldUnselectRow = newRowSelections.at(rowIndex)?.length === 0;

      const isSelectedCell = selection.some(
        (row, index) => row && index === rowIndex && row.includes(columnIndex),
      );
      const isOnlySelectedCell =
        selection.length > 0 &&
        selection.every(
          (row, index) => row && index === rowIndex && row.length === 1 && row[0] === columnIndex,
        );

      const getRowWithTargetColumn = (column: number, row: number) => {
        const newRow = [...(newRowSelections.at(row) ?? []), column];

        return newRow.length === columns?.length ? [] : newRow;
      };

      if (shouldUnselectRow) {
        delete newRowSelections[rowIndex];
        lastSelectedCellIndicesRef.current = lastSelectedCellIndicesRef.current.filter(
          ([index]) => index !== rowIndex,
        );
      } else if (isOnlySelectedCell || ((addSelection || addConsecutive) && isSelectedCell)) {
        if (newRowSelections[rowIndex]) {
          newRowSelections[rowIndex] = newRowSelections[rowIndex].filter(
            (column) => column !== columnIndex,
          );
          if (newRowSelections[rowIndex].length === 0) {
            delete newRowSelections[rowIndex];
          }
        }

        lastSelectedCellIndicesRef.current = lastSelectedCellIndicesRef.current.filter(
          ([row, column]) => row !== rowIndex || column !== columnIndex,
        );
      } else {
        const firstSelectedRowIndex = selection.findIndex(Boolean);
        const selectedRowCount = selection.filter(Boolean).length;
        const singleRowSelectionIndices =
          selectedRowCount === 1 && selection[firstSelectedRowIndex].length === 0
            ? [firstSelectedRowIndex]
            : undefined;

        const lastSelectedCellIndices =
          lastSelectedCellIndicesRef.current.slice(-1).at(0) ?? singleRowSelectionIndices;

        if (addConsecutive && lastSelectedCellIndices) {
          const lastSelectedCellRowIndex = lastSelectedCellIndices[0];
          const lastSelectedCellColumnIndex = lastSelectedCellIndices[1];

          const startRow = Math.min(lastSelectedCellRowIndex, rowIndex);
          const endRow = Math.max(lastSelectedCellRowIndex, rowIndex);

          for (let i = startRow; i <= endRow; i++) {
            if (lastSelectedCellColumnIndex === undefined) {
              newRowSelections[i] = [];
              continue;
            }

            const startColumn = Math.min(lastSelectedCellColumnIndex, columnIndex);
            const endColumn = Math.max(lastSelectedCellColumnIndex, columnIndex);

            for (let j = startColumn; j <= endColumn; j++) {
              if (!newRowSelections[i]?.includes(j) && newRowSelections[i]?.length !== 0) {
                newRowSelections[i] = getRowWithTargetColumn(j, i);
              }
            }
          }

          if (lastSelectedCellColumnIndex === undefined) {
            lastSelectedCellIndicesRef.current.push([rowIndex]);
          } else {
            lastSelectedCellIndicesRef.current.push([rowIndex, columnIndex]);
          }
        } else {
          newRowSelections[rowIndex] = getRowWithTargetColumn(columnIndex, rowIndex);
          lastSelectedCellIndicesRef.current.push([rowIndex, columnIndex]);
        }
      }

      setSelection(newRowSelections);

      track('table_cell_click');
    },
    [columns?.length, handleCellDoubleClick, selection, track],
  );

  return {
    handleCellClick,
    handleCellDoubleClick,
    selection,
    selectionActionsRef,
    setSelection,
    tableContentRef,
  };
};
