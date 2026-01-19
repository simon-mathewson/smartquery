import { ArrowBack, ArrowForward } from '@mui/icons-material';
import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import { usePagination } from './usePagination';
import { Add } from './createRow/CreateRow';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../Context';
import { AnalyticsContext } from '~/content/analytics/Context';
import { formatNumber } from '@/utils/formatNumber';
import { assert } from 'ts-essentials';

export type BottomToolbarProps = {
  canAdd: boolean;
  compact?: boolean;
  disablePagination?: boolean;
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const BottomToolbar: React.FC<BottomToolbarProps> = (props) => {
  const { handleRowCreationRef, canAdd, disablePagination, compact } = props;

  const { track } = useDefinedContext(AnalyticsContext);

  const result = useDefinedContext(ResultContext);
  assert(!('error' in result), 'Result is an error');
  const { rows } = result;

  const { limit, next, offset, previous, totalRows } = usePagination();

  const limitText = limit
    ? `${(offset ?? 0) + 1}–${Math.min((offset ?? 0) + limit, totalRows ?? 0)}`
    : undefined;
  const paginationText = [limitText, totalRows === undefined ? undefined : formatNumber(totalRows)]
    .filter(Boolean)
    .join(' of ');

  const previousDisabled = !offset;
  const nextDisabled = totalRows !== undefined && totalRows - ((offset ?? 0) + (limit ?? 0)) <= 0;

  return (
    <Header
      compact={compact}
      left={canAdd && <Add handleRowCreationRef={handleRowCreationRef} />}
      middle={
        ((totalRows !== undefined && totalRows > 0) || rows.length > 0) && (
          <div className="text-xs text-textSecondary">
            {totalRows ? paginationText : formatNumber(rows.length)} rows
          </div>
        )
      }
      right={
        !disablePagination &&
        limit !== undefined &&
        totalRows !== undefined &&
        (!previousDisabled || !nextDisabled) && (
          <>
            <Button
              color="primary"
              htmlProps={{
                disabled: previousDisabled,
                onClick: () => {
                  track('table_pagination_previous');
                  void previous();
                },
              }}
              icon={<ArrowBack />}
              tooltip="Previous page"
            />
            <Button
              color="primary"
              htmlProps={{
                disabled: nextDisabled,
                onClick: () => {
                  track('table_pagination_next');
                  void next();
                },
              }}
              icon={<ArrowForward />}
              tooltip="Next page"
            />
          </>
        )
      }
    />
  );
};
