import { List } from '~/shared/components/list/List';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import classNames from 'classnames';
import { AnalyticsContext } from '~/content/analytics/Context';
import { routes } from '~/router/routes';
import { Loading } from '~/shared/components/loading/Loading';
import { ActiveConnectionContext } from '../activeConnection/Context';

export const DatabaseList: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { activeConnection, databases, isLoadingDatabases } =
    useDefinedContext(ActiveConnectionContext);

  const [labelId] = useState(uuid);

  const schemas = useMemo(() => {
    if (activeConnection.engine !== 'postgres') return [];

    return databases.find((database) => database.name === activeConnection.database)?.schemas ?? [];
  }, [activeConnection, databases]);

  if (!activeConnection) {
    return null;
  }

  return (
    <div
      className={classNames('grid gap-2', {
        'grid-cols-[max-content_192px_max-content_192px]': activeConnection.engine === 'postgres',
        'grid-cols-[max-content_192px]': activeConnection.engine !== 'postgres',
      })}
    >
      <div className="h-full w-px bg-border" />
      <div className="relative">
        <h2
          className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-1 text-sm font-medium text-textPrimary"
          id={labelId}
        >
          Databases
        </h2>
        {isLoadingDatabases && <Loading />}
        <List
          htmlProps={{ 'aria-labelledby': labelId }}
          items={databases.map((database) => ({
            htmlProps: {
              href: routes.connection({
                connectionId: activeConnection.id,
                database: database.name,
                schema: '',
              }),
            },
            label: database.name,
            selectedVariant: 'primary',
            value: database.name,
          }))}
          onSelect={() => track('database_list_select')}
          selectedValue={activeConnection.database}
        />
      </div>
      {activeConnection.engine === 'postgres' && (
        <>
          <div className="h-full w-px bg-border" />
          <div className="relative">
            <h2
              className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-1 text-sm font-medium text-textPrimary"
              id={labelId}
            >
              Schemas
            </h2>
            {isLoadingDatabases && <Loading />}
            <List
              htmlProps={{ 'aria-labelledby': labelId }}
              items={schemas.map((schema) => ({
                htmlProps: {
                  href: routes.connection({
                    connectionId: activeConnection.id,
                    database: activeConnection.database,
                    schema,
                  }),
                },
                label: schema,
                selectedVariant: 'primary',
                value: schema,
              }))}
              onSelect={() => track('database_list_select_schema')}
              selectedValue={activeConnection.schema}
            />
          </div>
        </>
      )}
    </div>
  );
};
