import { useEffect, useState } from 'react';
import { assert } from 'ts-essentials';
import { useDebouncedCallback } from 'use-debounce';
import type { Row } from '~/shared/types';
import { CELL_HEIGHT } from './cell/constants';

const ROW_HEIGHT = CELL_HEIGHT;
const BUFFER_ROWS = 50;

export const useVirtualization = (rows: Row[], tableRef: React.RefObject<HTMLDivElement>) => {
  const [topRowsHiddenCount, setTopRowsHiddenCount] = useState(0);
  const [visibleRowCount, setVisibleRowCount] = useState(0);
  const bottomRowsHiddenCount = Math.max(0, rows.length - topRowsHiddenCount - visibleRowCount);

  const onScroll = useDebouncedCallback(
    () => {
      assert(tableRef.current);

      const rowsToHide = Math.floor(tableRef.current.scrollTop / ROW_HEIGHT);
      setTopRowsHiddenCount(Math.max(0, rowsToHide - Math.ceil(BUFFER_ROWS / 2)));
    },
    10,
    { maxWait: 100 },
  );

  useEffect(() => {
    assert(tableRef.current);

    const table = tableRef.current;
    table.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { height } = entry.contentRect;
      const availableRows = Math.ceil(height / ROW_HEIGHT) + 1 + BUFFER_ROWS;
      setVisibleRowCount(availableRows);
    });

    resizeObserver.observe(tableRef.current);

    return () => {
      resizeObserver.disconnect();
      table.removeEventListener('scroll', onScroll);
    };
  }, [onScroll, tableRef]);

  return { topRowsHiddenCount, visibleRowCount, bottomRowsHiddenCount };
};
