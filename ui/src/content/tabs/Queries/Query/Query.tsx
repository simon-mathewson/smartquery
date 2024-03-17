import { Close } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Button } from '../../../../shared/components/Button/Button';
import type { Query as QueryType } from '../../../../shared/types';
import { TabsContext } from '../../Context';
import { InputModes } from './inputModes/InputModes';
import { Table } from './Table/Table';
import type { InputMode } from './types';
import { getQueryTitle } from './utils';
import { InputModesSelect } from './inputModes/Select';
import { SearchProvider } from './inputModes/search/Provider';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
import { Pagination } from './addAndPagination/AddAndPagination';

export type QueryProps = {
  columnIndex: number;
  query: QueryType;
  rowIndex: number;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { columnIndex, query, rowIndex } = props;

  const { queryResults, removeQuery } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const [inputMode, setInputMode] = useState<InputMode | undefined>(
    !query.sql ? 'editor' : undefined,
  );

  return (
    <SearchProvider query={query}>
      <div
        className={classNames(
          'relative ml-3 mt-3 flex min-h-[240px] flex-col justify-start gap-2 overflow-hidden rounded-xl border border-border bg-card p-2',
          {
            '!ml-0': columnIndex === 0,
            '!mt-0': rowIndex === 0,
          },
        )}
      >
        <ThreeColumns
          left={
            queryResult ? (
              <InputModesSelect inputMode={inputMode} query={query} setInputMode={setInputMode} />
            ) : null
          }
          middle={
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
              {getQueryTitle(query)}
            </div>
          }
          right={
            <Button color="secondary" icon={<Close />} onClick={() => removeQuery(query.id)} />
          }
        />
        <InputModes inputMode={inputMode} query={query} />
        <Table query={query} />
        <Pagination query={query} />
      </div>
    </SearchProvider>
  );
};
