import { initTRPC } from '@trpc/server';
import { uniqueId } from 'lodash';
import superjson from 'superjson';
import { z } from 'zod';
import { MySqlClient, PostgresClient } from '../../prisma';
import { convertPrismaValue } from './convertValueToString';
import { getMetadata } from './getMetadata';
import type { PrismaValue } from './types';
import { connectionSchema, type Client } from './types';

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

    console.info('Processing query', query);

    const client = clients[clientId];
    const { prisma } = client;

    const statements = query
      .match(/(?:".*"|'.*'|`.*`|[^;])*(?:;)?/g)
      ?.map((statement) => statement.trim())
      .filter(Boolean);

    if (!statements) {
      throw new Error('No statements found in query');
    }

    console.info('Parsed statements', statements);

    const results = await (prisma as PostgresClient).$transaction(
      statements.map((statement) =>
        (prisma as PostgresClient).$queryRawUnsafe<Array<Record<string, PrismaValue>>>(statement),
      ),
    );

    console.info('Executed queries', results);

    const rowsWithColumns = await Promise.all(
      results.map(async (result, index) => {
        const metadata = await getMetadata({
          client,
          statement: statements[index],
        });

        const rows = result.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([columnName, value]) => {
              const column = metadata?.columns?.find(
                (column) => (column.alias ?? column.name) === columnName,
              );
              return [columnName, convertPrismaValue(value, column?.dataType)];
            }),
          ),
        );

        return {
          columns: metadata?.columns ?? null,
          rows,
          table: metadata?.table ?? null,
        };
      }),
    );

    console.log('Processed query results', rowsWithColumns);

    return rowsWithColumns;
  }),
});

export type AppRouter = typeof router;
