import { DropMarker } from '~/content/dragAndDrop/DropMarker';
import React from 'react';
import { Query } from './query/Query';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { TabsContext } from '../Context';
import { QueryProvider } from './query/Provider';
import { Logo } from '~/shared/components/logo/Logo';

export const Queries: React.FC = () => {
  const { activeTab } = useDefinedContext(TabsContext);

  if (!activeTab) {
    return (
      <div className="flex grow items-center justify-center">
        <Logo htmlProps={{ className: 'w-50 pointer-events-none opacity-10 grayscale' }} />
      </div>
    );
  }

  return (
    <div className="flex h-full grow justify-start overflow-hidden" key={activeTab.id}>
      <DropMarker column={0} row={0} />
      {activeTab.queries.map((column, columnIndex) => (
        <React.Fragment key={columnIndex}>
          <div className="flex grow basis-0 flex-col justify-start overflow-hidden">
            <DropMarker column={columnIndex} horizontal row={0} />
            {column.map((query, rowIndex) => (
              <React.Fragment key={query.id}>
                <QueryProvider columnIndex={columnIndex} query={query} rowIndex={rowIndex}>
                  <Query />
                  <DropMarker column={columnIndex} horizontal row={rowIndex + 1} />
                </QueryProvider>
              </React.Fragment>
            ))}
          </div>
          <DropMarker column={columnIndex + 1} row={0} />
        </React.Fragment>
      ))}
    </div>
  );
};
