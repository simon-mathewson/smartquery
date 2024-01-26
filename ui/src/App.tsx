import React from 'react';
import { NavigationSidebar } from './content/NavigationSidebar/NavigationSidebar';
import { DropMarker } from './content/dragAndDrop/DropMarker';
import { Query } from './content/queries/Query/Query';
import './index.css';
import { useDefinedContext } from './shared/hooks/useDefinedContext';
import { QueriesContext } from './content/queries/Context';
import { Button } from './shared/components/Button/Button';
import { Add } from '@mui/icons-material';
import { ConnectionsContext } from './content/connections/Context';

export const App: React.FC = () => {
  const { activeConnection } = useDefinedContext(ConnectionsContext);
  const { addQuery, queries } = useDefinedContext(QueriesContext);

  return (
    <div className="grid h-full grid-cols-[224px_1fr]">
      <NavigationSidebar />
      <div className="flex h-full flex-col overflow-hidden bg-white">
        {activeConnection && (
          <div className="border-b border-b-gray-200 p-2">
            <Button
              align="left"
              className="mb-1"
              icon={<Add />}
              label="Query"
              onClick={() => addQuery({ showEditor: true })}
              variant="primary"
            />
          </div>
        )}
        {queries.length === 0 ? (
          <div className="flex grow items-center justify-center">
            <img className="w-50 h-max opacity-20" src="/LogoIcon.svg" />
          </div>
        ) : (
          <div className="flex h-full justify-start overflow-hidden">
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
