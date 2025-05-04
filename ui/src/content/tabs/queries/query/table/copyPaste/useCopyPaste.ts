import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../../Context';
import { useCallback, useEffect } from 'react';
import { getTsvFromSelection } from '../utils/getTsvFromSelection';
import type { CreateRow } from '~/content/edit/types';

export const useCopyPaste = (
  selection: number[][],
  rowsToCreate: CreateRow[],
  tableRef: React.RefObject<HTMLDivElement>,
) => {
  const { rows } = useDefinedContext(ResultContext);

  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.repeat ||
        (tableRef.current !== document.activeElement &&
          !tableRef.current?.contains(document.activeElement))
      )
        return;

      if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const tsv = getTsvFromSelection(selection, [...rows, ...rowsToCreate]);
        navigator.clipboard.writeText(tsv);
      }
      if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
      }
    },
    [rows, rowsToCreate, selection, tableRef],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [onKeydown]);
};
