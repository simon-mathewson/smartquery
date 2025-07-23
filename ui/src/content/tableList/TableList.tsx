import classNames from 'classnames';
import { uniq } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { assert } from 'ts-essentials';
import { AnalyticsContext } from '~/content/analytics/Context';
import { List } from '~/shared/components/list/List';
import { Loading } from '~/shared/components/loading/Loading';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { addQuotes } from '~/shared/utils/sql/sql';
import { isNotUndefined } from '~/shared/utils/typescript/typescript';
import { ActiveConnectionContext } from '../connections/activeConnection/Context';
import { useDrag } from '../dragAndDrop/useDrag/useDrag';
import { TabsContext } from '../tabs/Context';
import { QueriesContext } from '../tabs/queries/Context';

type Table = { name: string; schema: string | undefined };

export const TableList: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);

  const { activeConnection, isLoadingDatabases, runQuery } =
    useDefinedContext(ActiveConnectionContext);
  const { activeTab } = useDefinedContext(TabsContext);
  const { addQuery, queryResults } = useDefinedContext(QueriesContext);

  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { database, engine } = activeConnection;

    const tableNamesStatement = (() => {
      switch (engine) {
        case 'mysql':
          return `
            SELECT table_name AS t FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
            AND table_schema = '${database}'
            ORDER BY t ASC
          `;
        case 'postgres':
          return `
            SELECT table_name AS t, table_schema AS s FROM information_schema.tables
            WHERE table_type = 'BASE TABLE'
            ${activeConnection.schema ? `AND table_schema = '${activeConnection.schema}'` : ''}
            AND table_catalog = '${database}'
            ORDER BY t ASC
          `;
        case 'sqlite':
          return `
            SELECT name AS t FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            ORDER BY t ASC
          `;
      }
    })();

    setIsLoading(true);

    void runQuery([tableNamesStatement], { skipSqliteWrite: true })
      .then(([rows]) => {
        setTables(rows.map(({ t, s }) => ({ name: String(t), schema: s ? String(s) : undefined })));
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConnection]);

  const selectedTables = uniq(
    activeTab?.queries.flatMap((query) =>
      query
        .map((q) => {
          const result = q.id in queryResults ? queryResults[q.id] : null;
          return result?.table
            ? tables.find((t) => t.name === result.table && t.schema === result.schema)
            : undefined;
        })
        .filter(isNotUndefined),
    ),
  ) satisfies Table[];

  const getQuery = (table: Table) => {
    assert(activeConnection);

    switch (activeConnection.engine) {
      case 'mysql':
        return {
          sql: `SELECT * FROM ${table.name} LIMIT 50`,
        };
      case 'postgres':
        return {
          sql: `SELECT * FROM ${
            activeConnection.schema ? '' : `${addQuotes(activeConnection.engine, table.schema!)}.`
          }${addQuotes(activeConnection.engine, table.name)} LIMIT 50`,
        };
      case 'sqlite':
        return {
          sql: `SELECT * FROM ${table.name} LIMIT 50`,
        };
    }
  };

  const { getHandleMouseDown, isDragging } = useDrag<Table>({
    onDrop: (dropProps) => {
      const {
        item: table,
        dropMarker: { column, horizontal, row },
      } = dropProps;

      assert(activeTab);

      void addQuery(getQuery(table), {
        position: { column, row: horizontal ? row : undefined },
        run: true,
        tabId: activeTab.id,
      });

      track('table_list_drag_drop');
    },
  });

  const [search, setSearch] = useState('');

  const filteredTables = useMemo(() => {
    return tables.filter((table) => table.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, tables]);

  return (
    <div className="relative flex w-full grow flex-col gap-1 overflow-hidden py-2">
      {isLoading || isLoadingDatabases ? (
        <Loading />
      ) : (
        <List<Table>
          emptyPlaceholder="This database is empty."
          items={filteredTables.map((table) => ({
            className: classNames({
              '!opacity-50': isDragging,
            }),
            label: table.name,
            onMouseDown: getHandleMouseDown(table),
            selectedVariant: 'secondary',
            value: table,
          }))}
          multiple
          onSelect={(table) => {
            void addQuery(getQuery(table), {
              // Unless table is already selected, open tab that already contains this query if
              // applicable
              openIfExists: !selectedTables.includes(table),
            });
            track('table_list_select');
          }}
          selectedValues={selectedTables}
          search={search}
          searchPlaceholder="Tables"
          setSearch={setSearch}
        />
      )}
    </div>
  );
};
