import { Close, Refresh } from '@mui/icons-material';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { Button } from '../../../../shared/components/Button/Button';
import { InputModes } from './inputModes/InputModes';
import { Table } from './Table/Table';
import type { InputMode } from './types';
import { getQueryTitle } from './utils';
import { InputModesSelect } from './inputModes/Select';
import { ThreeColumns } from '~/shared/components/ThreeColumns/ThreeColumns';
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
    !query.firstSelectStatement ? 'editor' : undefined,
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
      <ThreeColumns
        left={
          result ? <InputModesSelect inputMode={inputMode} setInputMode={setInputMode} /> : null
        }
        middle={
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-textPrimary">
            {getQueryTitle(result)}
          </div>
        }
        right={
          <>
            {result && <Button icon={<Refresh />} onClick={() => runQuery(query.id)} />}
            <Button color="secondary" icon={<Close />} onClick={() => removeQuery(query.id)} />
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
    </div>
  );
};
