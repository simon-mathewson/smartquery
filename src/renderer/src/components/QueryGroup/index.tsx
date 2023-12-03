import { Query as QueryType } from '@renderer/types';
import React, { useEffect, useState } from 'react';
import { Tabs } from './Tabs/Tabs';
import { Query } from '../Query/Query';

export type QueryGroupProps = {
  columnIndex: number;
  queries: QueryType[];
  rowIndex: number;
};

export const QueryGroup: React.FC<QueryGroupProps> = (props) => {
  const { columnIndex, queries, rowIndex } = props;

  const [activeQueryIndex, setActiveQueryIndex] = useState<number | null>(null);

  const activeQuery = activeQueryIndex !== null ? queries[activeQueryIndex] : null;

  useEffect(() => {
    if (activeQueryIndex === null && queries.length) {
      setActiveQueryIndex(0);
      return;
    }
    if (activeQueryIndex !== null && activeQueryIndex >= queries.length) {
      setActiveQueryIndex(activeQueryIndex - 1);
    }
  }, [activeQueryIndex, queries]);

  return (
    <React.Fragment>
      <div className="flex flex-grow flex-col justify-start border-l border-l-gray-200 ">
        <Tabs
          activeQueryIndex={activeQueryIndex}
          columnIndex={columnIndex}
          queries={queries}
          rowIndex={rowIndex}
          setActiveQueryIndex={setActiveQueryIndex}
        />
        {activeQuery && <Query key={activeQuery.id} query={activeQuery} />}
      </div>
    </React.Fragment>
  );
};
