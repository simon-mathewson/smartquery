import React, { useState } from 'react';
import { Query as QueryType } from '../types';
import { Table } from './Table/Table';
import { Editor } from '../../../shared/components/Editor/Editor';
import { Button } from '../../../shared/components/Button/Button';
import { Close, Code } from '@mui/icons-material';
import { Header } from '../../../shared/components/Header/Header';
import classNames from 'classnames';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { QueriesContext } from '../Context';

export type QueryProps = {
  columnIndex: number;
  query: QueryType;
  rowIndex: number;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { columnIndex, query, rowIndex } = props;

  const { removeQuery, updateQuery } = useDefinedContext(QueriesContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);

  return (
    <div
      className={classNames(
        'border-gray-150 relative ml-2 mt-2 flex min-h-[240px] max-w-max flex-col justify-start gap-2 overflow-hidden rounded-xl border bg-white p-2',
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
              selected={showEditor}
            />
          ) : null
        }
        right={<Button icon={<Close />} onClick={() => removeQuery(query.id)} variant="tertiary" />}
        title={query.table ?? 'New query'}
      />
      {showEditor && (
        <div className="px-2 pb-2">
          <Editor initialValue={query.sql ?? ''} onSubmit={(sql) => updateQuery(query.id, sql)} />
        </div>
      )}

      <Table query={query} />
    </div>
  );
};
