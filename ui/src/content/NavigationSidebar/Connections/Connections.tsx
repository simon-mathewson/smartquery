import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';
import { ListItem } from '~/shared/components/ListItem/ListItem';
import { OverlayCard } from '~/shared/components/OverlayCard/OverlayCard';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { ConnectionForm } from './ConnectionForm/ConnectionForm';
import { trpc } from '~/trpc';
import { ConnectionsContext } from '~/content/connections/Context';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  const { activeConnection, connect, connections } = useDefinedContext(ConnectionsContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = React.useState(false);

  const [connectionToEditIndex, setConnectionToEditIndex] = useState<number | null>(null);

  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { clientId, engine } = activeConnection;

    const databasesQuery = {
      mysql:
        "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
      postgresql:
        'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
      sqlserver:
        "SELECT name AS db FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb') ORDER BY name ASC",
    }[engine];
    const ac = new AbortController();

    trpc.sendQuery.query([clientId, databasesQuery], { signal: ac.signal }).then(([{ rows }]) => {
      setDatabases(rows.map(({ db }) => db as string));
    });

    return () => ac.abort();
  }, [activeConnection]);

  return (
    <OverlayCard
      align="left"
      className="w-max p-2 shadow-2xl"
      onOpen={() => setIsAddingOrEditing(false)}
      triggerRef={triggerRef}
    >
      {() => (
        <>
          {isAddingOrEditing ? (
            <ConnectionForm
              connectionToEditIndex={connectionToEditIndex}
              exit={() => {
                setConnectionToEditIndex(null);
                setIsAddingOrEditing(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-[256px_max-content_192px] gap-3">
              <div>
                <div className="flex items-center justify-between pb-2 pl-1">
                  <div className="text-textPrimary overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    Connections
                  </div>
                  <Button icon={<Add />} label="Add" onClick={() => setIsAddingOrEditing(true)} />
                </div>
                {connections.map((connection, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <ListItem
                      actions={[
                        {
                          icon: <EditOutlined />,
                          onClick: () => {
                            setConnectionToEditIndex(index);
                            setIsAddingOrEditing(true);
                          },
                        },
                      ]}
                      hint={`${connection.user}@${connection.host}:${connection.port}`}
                      label={connection.name}
                      onClick={() => connect(connection)}
                      selected={activeConnection?.id === connection.id}
                      selectedVariant="primary"
                    />
                  </div>
                ))}
              </div>
              <div className="bg-border h-full w-px" />
              <div>
                <div className="flex h-[44px] items-center pb-2 pl-1">
                  <div className="text-textPrimary overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                    Databases
                  </div>
                </div>
                {databases.map((database, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <ListItem
                      label={database}
                      onClick={() => {
                        if (!activeConnection) return;

                        return connect({ ...activeConnection, database });
                      }}
                      selected={activeConnection?.database === database}
                      selectedVariant="primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </OverlayCard>
  );
};
