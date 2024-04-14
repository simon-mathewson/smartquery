import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/Button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { useState } from 'react';
import { DatabaseList } from './databases/List';
import { ListItem } from '~/shared/components/ListItem/ListItem';
import { ConnectionForm } from './form/ConnectionForm';
import classNames from 'classnames';

export type ConnectionListProps = {
  hideDatabases?: boolean;
  isAddingOrEditing: boolean;
  setIsAddingOrEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ConnectionList: React.FC<ConnectionListProps> = (props) => {
  const { hideDatabases, isAddingOrEditing, setIsAddingOrEditing } = props;

  const { activeConnection, connect, connections } = useDefinedContext(ConnectionsContext);

  const [connectionToEditIndex, setConnectionToEditIndex] = useState<number | null>(null);

  return (
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
              <Button icon={<Add />} label="Add" onClick={() => setIsAddingOrEditing(true)} />
            </div>
            <div className="flex flex-col gap-1">
              {connections.map((connection, index) => (
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
                  key={index}
                  label={connection.name}
                  onClick={() => connect(connection.id)}
                  selected={activeConnection?.id === connection.id}
                  selectedVariant="primary"
                />
              ))}
            </div>
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
