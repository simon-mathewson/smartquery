import React from 'react';
import { NavigationSidebar } from './content/NavigationSidebar/NavigationSidebar';
import { ConnectionsContext } from './content/connections/Context';
import { DropMarker } from './content/dragAndDrop/DropMarker';
import { QueriesContext } from './content/queries/Context';
import { Query } from './content/queries/Query/Query';
import './index.css';
import { useDefinedContext } from './shared/hooks/useDefinedContext';
import { Toolbar } from './content/Toolbar/Toolbar';

export const App: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { queries } = useDefinedContext(QueriesContext);

  return (
    <div className="grid h-full grid-cols-[224px_1fr] bg-gray-50">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden pr-2">
        {activeConnection && <Toolbar />}
        {queries.length === 0 ? (
          <div className="flex grow items-center justify-center">
            <img className="w-50 h-max opacity-20" src="/logo.svg" />
          </div>
        ) : (
          <div className="flex h-full justify-start overflow-hidden pb-2">
            <DropMarker column={0} row={0} />
            {queries.map((column, columnIndex) => (
              <React.Fragment key={columnIndex}>
                <div className="flex flex-col justify-start overflow-hidden">
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
        )}
      </div>
    </div>
  );
};
