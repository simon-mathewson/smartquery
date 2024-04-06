import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../Context';
import { useCallback, useEffect } from 'react';
import { getTsvFromSelection } from '../utils/getTsvFromSelection';

export const useCopyPaste = (selection: number[][]) => {
  const { rows } = useDefinedContext(ResultContext);

  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        const tsv = getTsvFromSelection(selection, rows);
        navigator.clipboard.writeText(tsv);
      }
      if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
      }
    },
    [rows, selection],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [onKeydown]);
};
