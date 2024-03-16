import { ArrowBack, ArrowForward } from '@mui/icons-material';
import React from 'react';
import { Button } from '~/shared/components/Button/Button';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
import type { Query } from '~/shared/types';
import { usePagination } from './usePagination';

export type PaginationProps = {
  query: Query;
};

export const Pagination: React.FC<PaginationProps> = (props) => {
  const { query } = props;

  const { limit, next, offset, previous, total } = usePagination(query);

  if (!limit && !offset && !total) return null;

  const limitText = limit
    ? `${(offset ?? 0) + 1}–${Math.min((offset ?? 0) + limit, total ?? 0)}`
    : undefined;
  const paginationText = [limitText, total].filter(Boolean).join(' of ');

  return (
    <ThreeColumns
      middle={<div className="text-xs text-textSecondary">{paginationText}</div>}
      right={
        limit !== undefined &&
        total !== undefined && (
          <>
            <Button color="primary" disabled={!offset} icon={<ArrowBack />} onClick={previous} />
            <Button
              color="primary"
              disabled={total - ((offset ?? 0) + limit) <= 0}
              icon={<ArrowForward />}
              onClick={next}
            />
          </>
        )
      }
    />
  );
};
