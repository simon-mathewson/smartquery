import { useCallback, useEffect } from 'react';
import { AnalyticsContext } from '~/content/analytics/Context';
import type { CreateRow } from '~/content/edit/types';
import { NativeContext } from '~/content/native/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../../Context';
import { getTsvFromSelection } from '../utils/getTsvFromSelection';
import { isReactNative } from '~/content/native/useNative';

export const useCopyPaste = (
  selection: number[][],
  rowsToCreate: CreateRow[],
  tableRef: React.RefObject<HTMLDivElement>,
) => {
  const native = useDefinedContext(NativeContext);
  const { track } = useDefinedContext(AnalyticsContext);
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
        if (isReactNative) {
          native.writeToClipboard(tsv);
        } else {
          void navigator.clipboard.writeText(tsv);
        }

        track('table_copy');
      }
      if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        track('table_paste');
      }
    },
    [native, rows, rowsToCreate, selection, tableRef, track],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [onKeydown]);
};
