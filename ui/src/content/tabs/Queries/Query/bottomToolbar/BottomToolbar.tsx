import { ArrowBack, ArrowForward } from '@mui/icons-material';
import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
import { usePagination } from './usePagination';
import { Add } from './createRow/CreateRow';

export type BottomToolbarProps = {
  handleRowCreationRef: React.MutableRefObject<(() => void) | null>;
};

export const BottomToolbar: React.FC<BottomToolbarProps> = (props) => {
  const { handleRowCreationRef } = props;

  const { limit, next, offset, previous, total } = usePagination();

  const limitText = limit
    ? `${(offset ?? 0) + 1}–${Math.min((offset ?? 0) + limit, total ?? 0)}`
    : undefined;
  const paginationText = [limitText, total].filter(Boolean).join(' of ');

  const previousDisabled = !offset;
  const nextDisabled = total !== undefined && total - ((offset ?? 0) + (limit ?? 0)) <= 0;

  return (
    <ThreeColumns
      left={<Add handleRowCreationRef={handleRowCreationRef} />}
      middle={Boolean(total) && <div className="text-xs text-textSecondary">{paginationText}</div>}
      right={
        limit !== undefined &&
        total !== undefined &&
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
