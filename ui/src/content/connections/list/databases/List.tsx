import { useEffect, useState } from 'react';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ConnectionsContext } from '../../Context';
import { TrpcContext } from '~/content/trpc/Context';
import { List } from '~/shared/components/list/List';

export const DatabaseList: React.FC = () => {
  const trpc = useDefinedContext(TrpcContext);

  const { activeConnection, connect } = useDefinedContext(ConnectionsContext);

  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (!activeConnection) return;

    const { clientId, engine } = activeConnection;

    const databasesStatement = {
      mysql:
        "SELECT schema_name AS db FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'performance_schema', 'sys') ORDER BY schema_name ASC",
      postgresql:
        'SELECT datname AS db FROM pg_database WHERE datistemplate = false ORDER BY datname ASC',
    }[engine];
    const ac = new AbortController();

    trpc.sendQuery
      .mutate({ clientId, statements: [databasesStatement] }, { signal: ac.signal })
      .then(([rows]) => {
        setDatabases(rows.map(({ db }) => String(db)));
      });

    return () => ac.abort();
  }, [activeConnection, trpc]);

  return (
    <div>
      <div className="flex h-[44px] items-center pb-2 pl-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-textPrimary">
          Databases
        </div>
      </div>
      <List
        items={databases.map((database) => ({
          label: database,
          onSelect: () => {
            if (!activeConnection) return;

            return connect(activeConnection.id, { database });
          },
          selected: activeConnection?.database === database,
          selectedVariant: 'primary',
        }))}
      />
    </div>
  );
};
