import React from 'react';
import { Sidebar } from './content/Sidebar/Sidebar';
import { DropMarker } from './content/dragAndDrop/DropMarker';
import { Query } from './content/queries/Query/Query';
import './index.css';
import { useDefinedContext } from './shared/hooks/useDefinedContext';
import { QueriesContext } from './content/queries/Context';

export const App: React.FC = () => {
  const { queries } = useDefinedContext(QueriesContext);

  return (
    <div className="grid grid-cols-[224px_1fr]">
      <Sidebar />
      {queries.length === 0 && (
        <div className="flex items-center justify-center">
          <img className="w-50 h-max opacity-20" src="/LogoIcon.svg" />
        </div>
      )}
      <div className="h-full overflow-hidden bg-white">
        <div className="flex h-full justify-start overflow-hidden">
          <DropMarker column={0} row={0} />
          {queries.map((column, columnIndex) => (
            <React.Fragment key={columnIndex}>
              <div className="flex w-full flex-col justify-start overflow-hidden">
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
      </div>
    </div>
  );
};
