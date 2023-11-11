import React, { useState } from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { Button } from '../shared/Button/Button';
import { Close, Code } from '@mui/icons-material';
import { Header } from '../shared/Header/Header';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';

export type QueryProps = {
  query: QueryType;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { query } = props;

  const { setQueries } = useDefinedContext(GlobalContext);

  const [showEditor, setShowEditor] = useState(query.showEditor);

  return (
    <div className="relative grid h-max max-h-full min-w-[560px] grid-rows-[max-content_1fr] gap-4 rounded-xl bg-gray-50 p-2 shadow-lg">
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
        right={<Button icon={<Close />} onClick={() => setQueries([])} />}
        title={query.label ?? query.sql?.replaceAll('\n', ' ') ?? 'New Query'}
      />
      {showEditor && <QueryEditor query={query} />}
      <Table query={query} />
    </div>
  );
};
