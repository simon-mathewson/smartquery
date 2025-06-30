import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ConnectionsContext } from '../Context';
import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import classNames from 'classnames';
import { AnalyticsContext } from '~/content/analytics/Context';

export const DatabaseList: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, activeConnectionDatabases, connect } =
    useDefinedContext(ConnectionsContext);

  const [labelId] = useState(uuid);

  const schemas = useMemo(() => {
    if (!activeConnection || activeConnection.engine !== 'postgres') return [];

    return (
      activeConnectionDatabases.find((database) => database.name === activeConnection.database)
        ?.schemas ?? []
    );
  }, [activeConnection, activeConnectionDatabases]);

  return (
    <div
      className={classNames('grid gap-2', {
        'grid-cols-[max-content_192px_max-content_192px]': activeConnection?.engine === 'postgres',
        'grid-cols-[max-content_192px]': activeConnection?.engine !== 'postgres',
      })}
    >
      <div className="h-full w-px bg-border" />
      <div>
        <h2
          className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-1 text-sm font-medium text-textPrimary"
          id={labelId}
        >
          Databases
        </h2>
        <List
          htmlProps={{ 'aria-labelledby': labelId }}
          items={activeConnectionDatabases.map((database) => ({
            label: database.name,
            selectedVariant: 'primary',
            value: database.name,
          }))}
          onSelect={(database) => {
            if (!activeConnection) return;

            track('database_list_select');

            return connect(activeConnection.id, { database });
          }}
          selectedValue={activeConnection?.database ?? null}
        />
      </div>
      {activeConnection?.engine === 'postgres' && (
        <>
          <div className="h-full w-px bg-border" />
          <div>
            <h2
              className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-1 text-sm font-medium text-textPrimary"
              id={labelId}
            >
              Schemas
            </h2>
            <List
              htmlProps={{ 'aria-labelledby': labelId }}
              items={schemas.map((schema) => ({
                label: schema,
                selectedVariant: 'primary',
                value: schema,
              }))}
              onSelect={(schema) => {
                if (!activeConnection) return;

                track('database_list_select_schema');

                if (schema === activeConnection.schema) {
                  return connect(activeConnection.id, {
                    database: activeConnection.database,
                    schema: undefined,
                  });
                }

                return connect(activeConnection.id, {
                  database: activeConnection.database,
                  schema,
                });
              }}
              selectedValue={activeConnection?.schema ?? null}
            />
          </div>
        </>
      )}
    </div>
  );
};
