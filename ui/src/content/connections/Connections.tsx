import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from './Context';
import { useState } from 'react';
import { DatabaseList } from './databases/List';
import { ConnectionForm } from './form/ConnectionForm';
import classNames from 'classnames';
import { List } from '~/shared/components/list/List';
import { v4 as uuid } from 'uuid';

export type ConnectionsProps = {
  hideDatabases?: boolean;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { hideDatabases } = props;

  const { activeConnection, connect, connections } = useDefinedContext(ConnectionsContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = useState(() => connections.length === 0);

  const [connectionToEditId, setConnectionToEditId] = useState<string | undefined>(undefined);

  const [connectionsLabelId] = useState(uuid);

  return (
    <>
      {isAddingOrEditing ? (
        <ConnectionForm
          connectionToEditId={connectionToEditId}
          hideBackButton={connections.length === 0}
          exit={() => {
            setConnectionToEditId(undefined);
            setIsAddingOrEditing(false);
          }}
        />
      ) : (
        <div
          className={classNames('grid min-w-[256px] gap-3', {
            'grid-cols-[4fr_max-content_3fr]': !hideDatabases,
            'grid-cols-[1fr]': hideDatabases,
          })}
        >
          <div>
            <div className="flex items-center justify-between pb-2 pl-1">
              <div
                className="overflow-hidden text-ellipsis whitespace-nowrap pl-1 text-sm font-medium text-textPrimary"
                id={connectionsLabelId}
              >
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
              htmlProps={{ 'aria-labelledby': connectionsLabelId }}
              items={connections.map((connection) => ({
                actions: [
                  {
                    icon: <EditOutlined />,
                    label: 'Edit',
                    onClick: () => {
                      setConnectionToEditId(connection.id);
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
