import { ArrowBack, ArrowForward } from '@mui/icons-material';
import React from 'react';
import { Button } from '~/shared/components/button/Button';
import { ThreeColumns } from '~/shared/components/threeColumns/ThreeColumns';
import { usePagination } from './usePagination';
import { Add } from './createRow/CreateRow';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../Context';

export type BottomToolbarProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const BottomToolbar: React.FC<BottomToolbarProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { rows } = useDefinedContext(ResultContext);

  const { limit, next, offset, previous, totalRows } = usePagination();

  const limitText = limit
    ? `${(offset ?? 0) + 1}–${Math.min((offset ?? 0) + limit, totalRows ?? 0)}`
    : undefined;
  const paginationText = [limitText, totalRows].filter(Boolean).join(' of ');

  const previousDisabled = !offset;
  const nextDisabled = totalRows !== undefined && totalRows - ((offset ?? 0) + (limit ?? 0)) <= 0;

  return (
    <ThreeColumns
      left={<Add handleRowCreationRef={handleRowCreationRef} />}
      middle={
        ((totalRows !== undefined && totalRows > 0) || rows.length > 0) && (
          <div className="text-xs text-textSecondary">
            {totalRows ? paginationText : rows.length} rows
          </div>
        )
      }
      right={
        limit !== undefined &&
        totalRows !== undefined &&
        (!previousDisabled || !nextDisabled) && (
          <>
            <Button
              color="primary"
              disabled={previousDisabled}
              icon={<ArrowBack />}
              onClick={previous}
            />
            <Button
              color="primary"
              disabled={nextDisabled}
              icon={<ArrowForward />}
              onClick={next}
            />
          </>
        )
      }
    />
  );
};
