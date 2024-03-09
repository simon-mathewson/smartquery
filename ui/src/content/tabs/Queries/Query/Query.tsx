import React, { useState } from 'react';
import type { Query as QueryType } from '../../../../shared/types';
import { Table } from './Table/Table';
import { SqlEditor } from '../../../../shared/components/SqlEditor/SqlEditor';
import { Button } from '../../../../shared/components/Button/Button';
import { ArrowForward, Close, Code, Search } from '@mui/icons-material';
import { Header } from '../../../../shared/components/Header/Header';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '../../Context';
import { getQueryTitle } from './utils';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import type { InputMode } from './types';
import { Input } from '~/shared/components/Input/Input';

export type QueryProps = {
  columnIndex: number;
  query: QueryType;
  rowIndex: number;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { columnIndex, query, rowIndex } = props;

  const { queryResults, removeQuery, updateQuery } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  const [inputMode, setInputMode] = useState<InputMode | undefined>(
    query.showEditor ? 'editor' : undefined,
  );

  return (
    <div
      className={classNames(
        'relative ml-3 mt-3 flex min-h-[240px] flex-col justify-start gap-2 overflow-hidden rounded-xl border border-border bg-card p-2',
        {
          '!ml-0': columnIndex === 0,
          '!mt-0': rowIndex === 0,
        },
      )}
    >
      <Header
        left={
          queryResult ? (
            <ButtonSelect<'editor' | 'search'>
              onChange={(newValue) => setInputMode(newValue)}
              options={[
                {
                  button: {
                    color: 'primary',
                    icon: <Code />,
                    variant: 'default',
                  },
                  value: 'editor',
                },
                {
                  button: {
                    color: 'primary',
                    icon: <Search />,
                    variant: 'default',
                  },
                  value: 'search',
                },
              ]}
              selectedButton={{ variant: 'highlighted' }}
              value={inputMode}
            />
          ) : null
        }
        right={<Button color="secondary" icon={<Close />} onClick={() => removeQuery(query.id)} />}
        title={getQueryTitle(query)}
      />
      {inputMode === 'editor' && (
        <div className="px-2 pb-2">
          <SqlEditor
            initialValue={query.sql ?? ''}
            onSubmit={(sql) => updateQuery(query.id, sql)}
          />
        </div>
      )}
      {inputMode === 'search' && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <Input
            autoFocus
            className="w-52"
            onChange={console.log}
            placeholder={`Search ${query.table}`}
          />
          <Button
            color="primary"
            icon={<ArrowForward />}
            onClick={console.log}
            size="small"
            variant="filled"
          />
        </div>
      )}
      <Table query={query} />
    </div>
  );
};
