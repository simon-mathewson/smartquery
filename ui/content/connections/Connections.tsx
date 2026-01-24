import { Add, EditOutlined } from '@mui/icons-material';
import classNames from 'classnames';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { routes } from '~/router/routes';
import { Button } from '~/shared/components/button/Button';
import { Header } from '~/shared/components/header/Header';
import type { ListProps } from '~/shared/components/list/List';
import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useIsMobile } from '~/shared/hooks/useIsMobile/useIsMobile';
import { AnalyticsContext } from '../analytics/Context';
import { ConnectionsContext } from './Context';
import { DatabaseList } from './databases/DatabaseList';
import { ConnectionForm } from './form/ConnectionForm';
import { Menu } from './menu/Menu';

export type ConnectionsProps = {
  hideDatabases?: boolean;
  htmlProps?: React.HTMLAttributes<HTMLDivElement>;
  shouldNavigate?: boolean;
  variant?: ListProps<unknown>['variant'];
};

export const Connections: React.FC<ConnectionsProps> = (props) => {
  const { hideDatabases, htmlProps, shouldNavigate, variant } = props;

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
            className: classNames(
              'w-full',
              { 'sm:w-[400px]': !hideDatabases },
              htmlProps?.className,
            ),
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
          {...htmlProps}
          className={classNames(
            'w-full gap-3 sm:grid',
            {
              'grid-cols-[320px_auto]': !hideDatabases,
              'grid-cols-[320px]': hideDatabases,
            },
            htmlProps?.className,
          )}
        >
          <div className="space-y-2">
            {stage === 'connections' && (
              <Header
                evenColumns={isMobile}
                left={
                  isMobile ? undefined : (
                    <div className="pl-2" id={connectionsLabelId}>
                      Connections
                    </div>
                  )
                }
                middle={isMobile ? <div id={connectionsLabelId}>Connections</div> : undefined}
                right={
                  <div className="flex items-center gap-0">
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
                    <Menu />
                  </div>
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
                  element: 'link',
                  hint:
                    connection.type === 'remote'
                      ? `${connection.user}@${connection.host}:${connection.port}`
                      : undefined,
                  htmlProps: {
                    href:
                      connection.id !== activeConnection?.id
                        ? routes.connection({
                            connectionId: connection.id,
                            database: connection.database,
                            schema: connection.engine === 'postgres' ? connection.schema ?? '' : '',
                          })
                        : undefined,
                  },
                  label: connection.name,
                  onSelect: () => {
                    track('connections_select');
                    if (isMobile && activeConnection?.id === connection.id) {
                      setStage('databases');
                    }
                  },
                  selectedVariant: 'primary',
                  value: connection,
                }))}
                selectedValue={connections.find((c) => c.id === activeConnection?.id) ?? null}
                variant={variant}
              />
            )}
          </div>
          {!hideDatabases &&
            activeConnection &&
            (!isMobile || stage === 'databases' || stage === 'schemas') && (
              <DatabaseList stage={stage} setStage={setStage} variant={variant} />
            )}
        </div>
      )}
    </>
  );
};
