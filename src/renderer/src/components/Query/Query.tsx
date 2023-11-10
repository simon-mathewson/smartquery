import React from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';

export type QueryProps = {
  query: QueryType;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { query } = props;

  return (
    <div className="grid h-max max-h-full grid-rows-[max-content_1fr] gap-4 rounded-xl bg-gray-50 p-4 shadow-lg">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium leading-none text-gray-800">
        {query.label ?? query.sql.replaceAll('\n', ' ')}
      </div>
      <Table query={query} />
    </div>
  );
};
