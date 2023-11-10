import React, { useState } from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { Button } from '../shared/Button/Button';
import { Code } from '@mui/icons-material';

export type QueryProps = {
  query: QueryType;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { query } = props;

  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="relative grid h-max max-h-full grid-rows-[max-content_1fr] gap-4 rounded-xl bg-gray-50 p-2 shadow-lg">
      <div className="grid grid-cols-[36px_1fr_36px] items-center gap-2">
        <Button
          icon={<Code />}
          onClick={() => setShowEditor((current) => !current)}
          selected={showEditor}
        />
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium leading-none text-gray-800">
          {query.label ?? query.sql?.replaceAll('\n', ' ') ?? 'New Query'}
        </div>
        <div />
      </div>
      {showEditor && <QueryEditor query={query} />}
      <Table query={query} />
    </div>
  );
};
