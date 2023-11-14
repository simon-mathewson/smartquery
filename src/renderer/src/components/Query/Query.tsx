import React, { useState } from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';
import { Editor } from './Editor/Editor';
import { Button } from '../shared/Button/Button';
import { Close, Code } from '@mui/icons-material';
import { Header } from '../shared/Header/Header';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import classNames from 'classnames';

export type QueryProps = {
  query: QueryType;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { query } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);
  const [hasResults, setHasResults] = useState(false);

  return (
    <div
      className={classNames(
        'relative grid h-max max-h-full min-w-[440px] grid-rows-[max-content_1fr] gap-2 overflow-hidden rounded-xl bg-gray-50 p-2 shadow-lg',
        { 'grid-rows-[max-content_max-content_1fr]': showEditor && hasResults },
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
            onClick={() =>
              setQueries((columns) =>
                columns
                  .map((column) => column.filter((q) => q.id !== query.id))
                  .filter((column) => column.length),
              )
            }
          />
        }
        title={query.label ?? query.sql?.replaceAll('\n', ' ') ?? 'New Query'}
      />
      {showEditor && <Editor query={query} />}
      <Table hasResults={hasResults} query={query} setHasResults={setHasResults} />
    </div>
  );
};
