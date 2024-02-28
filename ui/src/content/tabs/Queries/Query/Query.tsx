import React, { useState } from 'react';
import type { Query as QueryType } from '../../../../shared/types';
import { Table } from './Table/Table';
import { SqlEditor } from '../../../../shared/components/SqlEditor/SqlEditor';
import { Button } from '../../../../shared/components/Button/Button';
import { Close, Code } from '@mui/icons-material';
import { Header } from '../../../../shared/components/Header/Header';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '../../Context';

export type QueryProps = {
  columnIndex: number;
  query: QueryType;
  rowIndex: number;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { columnIndex, query, rowIndex } = props;

  const { removeQuery, updateQuery } = useDefinedContext(TabsContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);

  return (
    <div
      className={classNames(
        'relative ml-2 mt-2 flex min-h-[240px] flex-col justify-start gap-2 overflow-hidden rounded-xl border border-border bg-card p-2',
        {
          '!ml-0': columnIndex === 0,
          '!mt-0': rowIndex === 0,
        },
      )}
    >
      <Header
        left={
          query.hasResults ? (
            <Button
              icon={<Code />}
              onClick={() => setShowEditor((current) => !current)}
              variant={showEditor ? 'selected' : 'default'}
            />
          ) : null
        }
        right={<Button color="secondary" icon={<Close />} onClick={() => removeQuery(query.id)} />}
        title={query.table ?? 'New query'}
      />
      {showEditor && (
        <div className="px-2 pb-2">
          <SqlEditor
            initialValue={query.sql ?? ''}
            onSubmit={(sql) => updateQuery(query.id, sql)}
          />
        </div>
      )}

      <Table query={query} />
    </div>
  );
};
