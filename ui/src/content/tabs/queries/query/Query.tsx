import { Close, Refresh } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Button } from '../../../../shared/components/button/Button';
import { InputModes } from './inputModes/InputModes';
import { Table } from './table/Table';
import type { InputMode } from './types';
import { getQueryTitle } from './utils';
import { InputModesSelect } from './inputModes/Select';
import { Header } from '~/shared/components/header/Header';
import { BottomToolbar } from './bottomToolbar/BottomToolbar';
import { QueryContext, ResultContext } from './Context';
import { QueriesContext } from '../Context';
import { useStoredState } from '~/shared/hooks/useLocalStorageState';

export const Query: React.FC = () => {
  const { removeQuery, runQuery } = useDefinedContext(QueriesContext);

  const { columnIndex, query, rowIndex } = useDefinedContext(QueryContext);

  const result = useContext(ResultContext);

  const inputModeStorageKey = `query-${query.id}-inputMode`;
  const [inputMode, setInputMode] = useStoredState<InputMode | undefined>(
    inputModeStorageKey,
    !query.select ? 'editor' : undefined,
    sessionStorage,
  );

  const handleRowCreationRef = React.useRef<(() => void) | null>(null);

  return (
    <div
      className={classNames(
        'relative ml-3 mt-3 flex min-h-[240px] flex-col justify-start gap-2 overflow-hidden rounded-xl border border-border bg-card p-2',
        {
          '!ml-0': columnIndex === 0,
          '!mt-0': rowIndex === 0,
        },
      )}
      data-query={query.id}
    >
      <Header
        left={
          result ? <InputModesSelect inputMode={inputMode} setInputMode={setInputMode} /> : null
        }
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            {getQueryTitle(query, result)}
          </div>
        }
        right={
          <>
            {result && query.select && (
              <div className="relative h-fit w-fit">
                <Button htmlProps={{ onClick: () => runQuery(query.id) }} icon={<Refresh />} />
                {query.isLoading && (
                  <CircularProgress
                    className="absolute left-[4px] top-[4px] !text-primary"
                    size={28}
                  />
                )}
              </div>
            )}
            <Button
              color="secondary"
              htmlProps={{ onClick: () => removeQuery(query.id) }}
              icon={<Close />}
            />
          </>
        }
      />
      <InputModes inputMode={inputMode} />
      {result && (
        <>
          <Table handleRowCreationRef={handleRowCreationRef} />
          <BottomToolbar handleRowCreationRef={handleRowCreationRef} />
        </>
      )}
      {!result && query.isLoading && (
        <div className="flex h-full w-full items-center justify-center py-8">
          <CircularProgress className="!text-primary" />
        </div>
      )}
    </div>
  );
};
