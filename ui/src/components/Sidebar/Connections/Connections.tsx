import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/components/shared/Button/Button';
import { ListItem } from '~/components/shared/ListItem/ListItem';
import { OverlayCard } from '~/components/shared/OverlayCard/OverlayCard';
import { GlobalContext } from '~/contexts/GlobalContext';
import { useDefinedContext } from '~/hooks/useDefinedContext';
import React, { useEffect, useState } from 'react';
import { ConnectionForm } from './ConnectionForm/ConnectionForm';
import { trpc } from '~/main';

export type ConnectionsProps = {
  triggerRef: React.MutableRefObject<HTMLElement | null>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { triggerRef } = props;

  const {
    connections,
    isDbReady,
    selectedConnectionIndex,
    selectedDatabase,
    setSelectedConnectionIndex,
    setSelectedDatabase,
  } = useDefinedContext(GlobalContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = React.useState(false);

  const [connectionToEditIndex, setConnectionToEditIndex] = useState<number | null>(null);

  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (!isDbReady) return;

    trpc.sendQuery
      .query(`SELECT datname FROM pg_database WHERE datistemplate = FALSE ORDER BY datname ASC`)
      .then(({ rows }) => {
        setDatabases(rows.map(({ datname }) => datname));
      });
  }, [isDbReady]);

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
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-800">
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
                      onClick={() => setSelectedConnectionIndex(index)}
                      selected={selectedConnectionIndex === index}
                      selectedVariant="primary"
                    />
                  </div>
                ))}
              </div>
              <div className="h-full w-px bg-gray-200" />
              <div>
                <div className="flex h-[44px] items-center pb-2 pl-1">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-800">
                    Databases
                  </div>
                </div>
                {databases.map((database, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <ListItem
                      label={database}
                      onClick={() => setSelectedDatabase(database)}
                      selected={selectedDatabase === database}
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
