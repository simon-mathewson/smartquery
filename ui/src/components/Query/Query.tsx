import React, { useState } from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';
import { Editor } from './Editor/Editor';
import { Button } from '../shared/Button/Button';
import { Close, Code } from '@mui/icons-material';
import { Header } from '../shared/Header/Header';
import classNames from 'classnames';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import { GlobalContext } from '~/contexts/GlobalContext';

export type QueryProps = {
  columnIndex: number;
  query: QueryType;
  rowIndex: number;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { columnIndex, query, rowIndex } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);
  const [hasResults, setHasResults] = useState(false);

  return (
    <div
      className={classNames(
        'relative flex w-full flex-grow flex-col justify-start gap-2 overflow-hidden border-l border-t border-l-gray-200 border-t-gray-200 p-2',
        {
          'border-l-0': columnIndex === 0,
          'border-t-0': rowIndex === 0,
        },
      )}
    >
      <Header
        left={
          hasResults ? (
            <Button
              icon={<Code />}
              onClick={() => setShowEditor((current) => !current)}
              selected={showEditor}
            />
          ) : null
        }
        right={
          <Button
            icon={<Close />}
            onClick={() => {
              setQueries((column) =>
                [
                  ...column
                    .map((row) => row.filter((q) => q.id !== query.id))
                    .filter((row) => row.length),
                ].filter((column) => column.length),
              );
            }}
            variant="tertiary"
          />
        }
        title=""
      />
      {showEditor && <Editor query={query} />}
      <Table hasResults={hasResults} query={query} setHasResults={setHasResults} />
    </div>
  );
};
