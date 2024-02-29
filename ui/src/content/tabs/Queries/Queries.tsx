import { DropMarker } from '~/content/dragAndDrop/DropMarker';
import React from 'react';
import { Query } from './Query/Query';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { TabsContext } from '../Context';

export const Queries: React.FC = () => {
  const { activeTab } = useDefinedContext(TabsContext);

  if (!activeTab) {
    return (
      <div className="flex grow items-center justify-center">
        <img className="w-50 h-max opacity-20" src="/logo.svg" />
      </div>
    );
  }

  return (
    <div className="flex h-full justify-start overflow-hidden pb-2" key={activeTab.id}>
      <DropMarker column={0} row={0} />
      {activeTab.queries.map((column, columnIndex) => (
        <React.Fragment key={columnIndex}>
          <div className="flex max-w-max grow basis-0 flex-col justify-start overflow-hidden">
            <DropMarker column={columnIndex} horizontal row={0} />
            {column.map((query, rowIndex) => (
              <React.Fragment key={query.id}>
                <Query columnIndex={columnIndex} query={query} rowIndex={rowIndex} />
                <DropMarker column={columnIndex} horizontal row={rowIndex + 1} />
              </React.Fragment>
            ))}
          </div>
          <DropMarker column={columnIndex + 1} row={0} />
        </React.Fragment>
      ))}
    </div>
  );
};
