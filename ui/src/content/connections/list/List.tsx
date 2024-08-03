import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { useState } from 'react';
import { DatabaseList } from './databases/List';
import { ConnectionForm } from './form/ConnectionForm';
import classNames from 'classnames';
import { List } from '~/shared/components/list/List';

export type ConnectionListProps = {
  hideDatabases?: boolean;
};

export const ConnectionList: React.FC<ConnectionListProps> = (props) => {
  const { hideDatabases } = props;

  const { activeConnection, connect, connections } = useDefinedContext(ConnectionsContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = useState(() => connections.length === 0);

  const [connectionToEditIndex, setConnectionToEditIndex] = useState<number | null>(null);

  return (
    <>
      {isAddingOrEditing ? (
        <ConnectionForm
          connectionToEditIndex={connectionToEditIndex}
          hideBackButton={connections.length === 0}
          exit={() => {
            setConnectionToEditIndex(null);
            setIsAddingOrEditing(false);
          }}
        />
      ) : (
        <div
          className={classNames('grid gap-3', {
            'grid-cols-[256px_max-content_192px]': !hideDatabases,
            'grid-cols-[256px]': hideDatabases,
          })}
        >
          <div>
            <div className="flex items-center justify-between pb-2 pl-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap pl-1 text-sm font-medium text-textPrimary">
                Connections
              </div>
              <Button
                htmlProps={{ onClick: () => setIsAddingOrEditing(true) }}
                icon={<Add />}
                label="Add"
              />
            </div>
            <List
              autoFocusFirstItem
              items={connections.map((connection, index) => ({
                actions: [
                  {
                    icon: <EditOutlined />,
                    onClick: () => {
                      setConnectionToEditIndex(index);
                      setIsAddingOrEditing(true);
                    },
                  },
                ],
                hint: `${connection.user}@${connection.host}:${connection.port}`,
                label: connection.name,
                selectedVariant: 'primary',
                value: connection.id,
              }))}
              onSelect={connect}
              selectedValue={activeConnection?.id ?? null}
            />
          </div>
          {!hideDatabases && (
            <>
              <div className="h-full w-px bg-border" />
              <DatabaseList />
            </>
          )}
        </div>
      )}
    </>
  );
};
