import React, { useState } from 'react';
import { Query as QueryType } from '../types';
import { Table } from './Table/Table';
import { Editor } from './Editor/Editor';
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

  const { removeQuery } = useDefinedContext(QueriesContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);

  return (
    <div
      className={classNames(
        'relative flex max-w-max grow flex-col justify-start gap-2 overflow-hidden border-l border-t border-l-gray-200 border-t-gray-200 p-2',
        {
          'border-l-0': columnIndex === 0,
          'border-t-0': rowIndex === 0,
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
      {showEditor && <Editor query={query} />}
      <Table query={query} />
    </div>
  );
};
