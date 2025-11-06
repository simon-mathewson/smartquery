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
import { routes } from '~/router/routes';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { Header } from '~/shared/components/header/Header';

export type ConnectionsProps = {
  hideDatabases?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  shouldNavigate?: boolean;
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { hideDatabases, htmlProps, shouldNavigate } = props;

  const isMobile = useIsMobile();

  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, connections } = useDefinedContext(ConnectionsContext);

  const [connectionToEditId, setConnectionToEditId] = useState<string | undefined>(undefined);

  const [connectionsLabelId] = useState(uuid);

  const [stage, setStage] = useState<'connections' | 'databases' | 'schemas' | 'form'>(
    'connections',
  );

  return (
    <>
      {stage === 'form' ? (
        <ConnectionForm
          htmlProps={{
            ...htmlProps,
            className: classNames(htmlProps?.className, { 'w-full sm:w-[320px]': !hideDatabases }),
          }}
          connectionToEditId={connectionToEditId}
          hideBackButton={connections.length === 0}
          exit={() => {
            setConnectionToEditId(undefined);
            setStage('connections');
          }}
        />
      ) : (
        <div
          className={classNames('gap-3 sm:grid', {
            'grid-cols-[280px_auto]': !hideDatabases,
            'grid-cols-[280px]': hideDatabases,
          })}
          {...htmlProps}
        >
          <div className="space-y-2">
            {stage === 'connections' && (
              <Header
                evenColumns={isMobile}
                left={isMobile ? undefined : 'Connections'}
                middle={isMobile ? 'Connections' : undefined}
                right={
                  <Button
                    element={shouldNavigate ? 'link' : 'button'}
                    htmlProps={{
                      href: shouldNavigate ? routes.addConnection() : undefined,
                      onClick: () => {
                        if (!shouldNavigate) {
                          setStage('form');
                        }
                        track('connections_add');
                      },
                    }}
                    icon={<Add />}
                    label="Add"
                  />
                }
              />
            )}
            {stage === 'connections' && (
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
                        setStage('form');
                        track('connections_edit');
                      },
                      tooltip: 'Edit',
                    },
                  ],
                  hint:
                    connection.type === 'remote'
                      ? `${connection.user}@${connection.host}:${connection.port}`
                      : undefined,
                  htmlProps: {
                    href: routes.connection({
                      connectionId: connection.id,
                      database: connection.database,
                      schema: connection.engine === 'postgres' ? connection.schema ?? '' : '',
                    }),
                  },
                  label: connection.name,
                  selectedVariant: 'primary',
                  value: connection,
                }))}
                onSelect={() => {
                  track('connections_select');
                  if (isMobile) {
                    setStage('databases');
                  }
                }}
                selectedValue={connections.find((c) => c.id === activeConnection?.id) ?? null}
              />
            )}
          </div>
          {!hideDatabases &&
            activeConnection &&
            (!isMobile || stage === 'databases' || stage === 'schemas') && (
              <DatabaseList stage={stage} setStage={setStage} />
            )}
        </div>
      )}
    </>
  );
};
