import { useCallback, useRef, useState } from 'react';
import { useClickOutside } from '~/shared/hooks/useClickOutside';

export const useCellSelection = () => {
  const [selection, setSelection] = useState<number[][]>([]);

  const tableRef = useRef<HTMLDivElement | null>(null);

  useClickOutside({
    handler: () => {
      setSelection([]);
      lastSelectedCellIndicesRef.current = [];
    },
    refs: [tableRef],
  });

  const lastClickRef = useRef<{ columnIndex: number; rowIndex: number; timestamp: number }>();
  const isDoubleClick = (row: number, column: number) =>
    lastClickRef.current !== undefined &&
    lastClickRef.current.columnIndex === column &&
    lastClickRef.current.rowIndex === row &&
    Date.now() - lastClickRef.current.timestamp < 300;

  const previousSelectionRef = useRef<number[][] | null>(null);
  const lastSelectedCellIndicesRef = useRef<[number, number?][]>([]);

  const handleCellDoubleClick = useCallback(
    (rowIndex: number, columnIndex: number, addSelection: boolean, addConsecutive: boolean) => {
      const newRowSelections =
        addSelection || addConsecutive ? [...(previousSelectionRef.current ?? [])] : [];
      lastSelectedCellIndicesRef.current.pop();

      const shouldUnselectCell = newRowSelections.at(rowIndex)?.includes(columnIndex);

      const addColumnToRow = (column: number, row: number) => [
        ...(newRowSelections.at(row) ?? []),
        column,
      ];

      if (shouldUnselectCell) {
        newRowSelections[rowIndex] = newRowSelections[rowIndex].filter(
          (column) => column !== columnIndex,
        );
        lastSelectedCellIndicesRef.current = lastSelectedCellIndicesRef.current.filter(
          ([row, column]) => row !== rowIndex || column !== columnIndex,
        );
      } else {
        const lastSelectedCellIndices = lastSelectedCellIndicesRef.current.slice(-1).at(0);

        if (addConsecutive && lastSelectedCellIndices) {
          const lastSelectedCellRowIndex = lastSelectedCellIndices[0];
          const lastSelectedCellColumnIndex = lastSelectedCellIndices[1] ?? columnIndex;

          const startRow = Math.min(lastSelectedCellRowIndex, rowIndex);
          const endRow = Math.max(lastSelectedCellRowIndex, rowIndex);
          const startColumn = Math.min(lastSelectedCellColumnIndex, columnIndex);
          const endColumn = Math.max(lastSelectedCellColumnIndex, columnIndex);

          for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
              if (!newRowSelections[i]?.includes(j)) {
                newRowSelections[i] = addColumnToRow(j, i);
              }
            }
          }
        } else {
          newRowSelections[rowIndex] = addColumnToRow(columnIndex, rowIndex);
        }

        lastSelectedCellIndicesRef.current.push([rowIndex, columnIndex]);
      }

      setSelection(newRowSelections);
    },
    [],
  );

  const handleCellClick = useCallback(
    async (event: React.MouseEvent, rowIndex: number, columnIndex: number) => {
      const addSelection = event.ctrlKey || event.metaKey;
      const addConsecutive = event.shiftKey;

      if (isDoubleClick(rowIndex, columnIndex)) {
        handleCellDoubleClick(rowIndex, columnIndex, addSelection, addConsecutive);
        return;
      }

      lastClickRef.current = { columnIndex, rowIndex, timestamp: Date.now() };

      const shouldUnselectRow = (rowSelections: number[][], rowIndex: number) => {
        const isEntireRowSelected = rowSelections.at(rowIndex)?.length === 0;
        if (!isEntireRowSelected) return false;

        if (addSelection || addConsecutive) return true;

        const isOtherRowSelected = rowSelections.some((_, index) => index !== rowIndex);
        return !isOtherRowSelected;
      };

      previousSelectionRef.current = selection;

      const newRowSelections = addSelection || addConsecutive ? [...selection] : [];

      if (shouldUnselectRow(selection, rowIndex)) {
        delete newRowSelections[rowIndex];
        lastSelectedCellIndicesRef.current = lastSelectedCellIndicesRef.current.filter(
          ([index]) => index !== rowIndex,
        );
      } else {
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
      }

      setSelection(newRowSelections);
    },
    [handleCellDoubleClick, selection],
  );

  return { handleCellClick, handleCellDoubleClick, selection, tableRef };
};
