import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { castArray, uniqueId } from 'lodash';
import { MySqlClient, PostgresClient, SqlServerClient } from '../../prisma';
import NodeSqlParser from 'node-sql-parser';
import type { PrismaValue } from './types';
import { connectionSchema, type Client } from './types';
import { getColumns } from './getColumns';
import { convertPrismaValue } from './convertValueToString';

const clients: {
  [connectionId: string]: Client;
} = {};

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router({
  connectDb: t.procedure.input(connectionSchema).mutation(async (props) => {
    const { database, engine, host, password, port, user } = props.input;

    const clientId = uniqueId();

    const client = {
      mysql: new MySqlClient({
        datasourceUrl: `mysql://${user}:${password}@${host}:${port}/${database}`,
      }),
      postgresql: new PostgresClient({
        datasourceUrl: `postgresql://${user}:${password}@${host}:${port}/${database}`,
      }),
      sqlserver: new SqlServerClient({
        datasourceUrl: `sqlserver://${host}:${port};database=${database};user=${user};password=${password};encrypt=DANGER_PLAINTEXT`,
      }),
    }[engine];

    // Connect right away so we get an error if connection is invalid
    await client.$connect();

    clients[clientId] = {
      connection: props.input,
      prisma: client,
    };

    return clientId;
  }),
  disconnectDb: t.procedure.input(z.string()).mutation(async (props) => {
    const clientId = props.input;
    if (!clients[clientId]) return;

    await clients[clientId]!.prisma.$disconnect();

    delete clients[clientId];
  }),
  sendQuery: t.procedure.input(z.tuple([z.string(), z.string()])).query(async (props) => {
    const [clientId, query] = props.input;

    const client = clients[clientId];
    const { connection, prisma } = client;
    const sqlParser = new NodeSqlParser.Parser();
    const parserOptions = {
      database: {
        mysql: 'mysql',
        postgresql: 'postgresql',
        sqlserver: 'transactsql',
      }[connection.engine],
    };
    const ast = sqlParser.astify(query, parserOptions);
    const parsedQueries = castArray(ast);

    const individualQueries = parsedQueries.map((ast) => sqlParser.sqlify(ast, parserOptions));

    const results = await (prisma as PostgresClient).$transaction(
      individualQueries.map((individualQuery) =>
        prisma.$queryRawUnsafe<Array<Record<string, PrismaValue>>>(individualQuery),
      ),
    );

    const rowsWithColumns = await Promise.all(
      results.map(async (result, index) => {
        const parsedQuery = parsedQueries[index];
        const table = parsedQuery.type === 'select' ? parsedQuery.from?.at(0).table : null;
        const columns = await getColumns(parsedQuery, client);

        const aliasToColumn =
          parsedQuery.type === 'select'
            ? parsedQuery.columns.reduce((acc, column) => {
                if (column.expr.type === 'column_ref' && column.as) {
                  acc[column.as] = column.expr.column;
                }
                return acc;
              }, {})
            : null;

        const rows = result.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([columnName, value]) => {
              const column = columns?.find(
                (column) =>
                  column.name === columnName || column.name === aliasToColumn?.[columnName],
              );
              return [columnName, convertPrismaValue(value, column?.dataType)];
            }),
          ),
        );

        return {
          columns,
          rows,
          table,
        };
      }),
    );

    return rowsWithColumns;
  }),
});

export type AppRouter = typeof router;
