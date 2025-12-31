import { Add, EditOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { AnalyticsContext } from '../analytics/Context';
import { ConnectionsContext } from './Context';
import { DatabaseList } from './databases/DatabaseList';
import { ConnectionForm } from './form/ConnectionForm';

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

  useEffect(() => {
    if (!activeConnection && isMobile && (stage === 'databases' || stage === 'schemas')) {
      setStage('connections');
    }
  }, [activeConnection, connections, isMobile, stage]);

  return (
    <>
      {stage === 'form' ? (
        <ConnectionForm
          htmlProps={{
            ...htmlProps,
            className: classNames(htmlProps?.className, { 'w-full sm:w-[328px]': !hideDatabases }),
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
                left={isMobile ? undefined : <div id={connectionsLabelId}>Connections</div>}
                middle={isMobile ? <div id={connectionsLabelId}>Connections</div> : undefined}
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
