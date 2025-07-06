import { Add, EditOutlined } from '@mui/icons-material';
import { Button } from '~/shared/components/button/Button';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from './Context';
import { useState } from 'react';
import { DatabaseList } from './databases/DatabaseList';
import { ConnectionForm } from './form/ConnectionForm';
import classNames from 'classnames';
import { List } from '~/shared/components/list/List';
import { v4 as uuid } from 'uuid';
import { AnalyticsContext } from '../analytics/Context';
import { useLocation } from 'wouter';
import { routes } from '~/router/routes';

export type ConnectionsProps = {
  hideDatabases?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { hideDatabases, htmlProps } = props;

  const [, navigate] = useLocation();
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, connections } = useDefinedContext(ConnectionsContext);

  const [isAddingOrEditing, setIsAddingOrEditing] = useState(() => connections.length === 0);

  const [connectionToEditId, setConnectionToEditId] = useState<string | undefined>(undefined);

  const [connectionsLabelId] = useState(uuid);

  return (
    <>
      {isAddingOrEditing ? (
        <ConnectionForm
          htmlProps={htmlProps}
          connectionToEditId={connectionToEditId}
          hideBackButton={connections.length === 0}
          exit={() => {
            setConnectionToEditId(undefined);
            setIsAddingOrEditing(false);
          }}
        />
      ) : (
        <div
          className={classNames('grid gap-3', {
            'grid-cols-[280px_auto]': !hideDatabases,
            'grid-cols-[280px]': hideDatabases,
          })}
          {...htmlProps}
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
                htmlProps={{
                  onClick: () => {
                    setIsAddingOrEditing(true);
                    track('connections_add');
                  },
                }}
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
                      track('connections_edit');
                    },
                    tooltip: 'Edit',
                  },
                ],
                hint:
                  connection.type === 'remote'
                    ? `${connection.user}@${connection.host}:${connection.port}`
                    : undefined,
                label: connection.name,
                selectedVariant: 'primary',
                value: connection,
              }))}
              onSelect={(connection) => {
                navigate(
                  routes.database({
                    connectionId: connection.id,
                    database: connection.database,
                    schema: connection.engine === 'postgres' ? connection.schema ?? '' : '',
                  }),
                );

                track('connections_select');
              }}
              selectedValue={connections.find((c) => c.id === activeConnection?.id) ?? null}
            />
          </div>
          {!hideDatabases && <DatabaseList />}
        </div>
      )}
    </>
  );
};
