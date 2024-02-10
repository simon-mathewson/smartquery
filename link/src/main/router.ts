import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { castArray, uniqueId } from 'lodash';
import { MySqlClient, PostgresClient, SqlServerClient } from '../../prisma';
import NodeSqlParser from 'node-sql-parser';

const clients: {
  [connectionId: string]: {
    connection: Connection;
    prisma: MySqlClient | PostgresClient | SqlServerClient;
  };
} = {};

const t = initTRPC.create({
  transformer: superjson,
});

type Value = string | number | boolean | Date | null;

const connectionSchema = z.object({
  database: z.string().trim().min(1),
  engine: z.union([z.literal('mysql'), z.literal('postgresql'), z.literal('sqlserver')]),
  host: z.string().trim().min(1),
  id: z.string(),
  name: z.string().trim().min(1),
  password: z.string(),
  port: z.number(),
  user: z.string().trim().min(1),
});

type Connection = z.infer<typeof connectionSchema>;

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

    await clients[clientId]!.prisma.$disconnect();

    delete clients[clientId];
  }),
  sendQuery: t.procedure.input(z.tuple([z.string(), z.string()])).query(async (props) => {
    const [clientId, query] = props.input;

    const { connection, prisma } = clients[clientId];
    const sqlParser = new NodeSqlParser.Parser();
    const parserOptions = {
      database: {
        mysql: 'mysql',
        postgresql: 'postgresql',
        sqlserver: 'transactsql',
      }[connection.engine],
    };
    const ast = sqlParser.astify(query, parserOptions);
    const individualQueries = castArray(ast).map((ast) => sqlParser.sqlify(ast, parserOptions));

    const result = await (prisma as PostgresClient).$transaction(
      individualQueries.map((individualQuery) =>
        prisma.$queryRawUnsafe<Array<Record<string, Value>>>(individualQuery),
      ),
    );

    return result;
  }),
});

export type AppRouter = typeof router;
