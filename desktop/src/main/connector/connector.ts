import { ConnectorNotFoundError } from '@/errors/ConnectorNotFoundError';
import type {
  ConnectDb,
  DisconnectDb,
  GetSqliteFile,
  RunQuery,
  SwitchCatalogOrSchema,
} from '@/native/types';
import assert from 'assert';
import type { BrowserWindow } from 'electron';
import { dialog } from 'electron';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { runQuery as runQueryFn } from './runQuery';
import type { Connector } from './types';

const connectors: Record<string, Connector> = {};

export const connectDb: ConnectDb = async (connection) => {
  const connector = await connect(connection);

  if (import.meta.env.DEV) {
    console.info('Connected to', connection.id);
  }

  connectors[connector.id] = connector;

  return connector.id;
};

export const switchCatalogOrSchema: SwitchCatalogOrSchema = async (
  connectorId,
  catalog,
  schema,
) => {
  if (!(connectorId in connectors)) {
    throw new ConnectorNotFoundError();
  }

  const connector = connectors[connectorId];

  if ('mysqlPool' in connector) {
    assert(!catalog, "Can't switch catalog for MySQL");
    assert(schema, 'Schema is required for switching schema for MySQL');

    await connector.mysqlPool.query(`USE ${schema}`);

    connector.connection.database = schema;
  } else if ('postgresPool' in connector) {
    if (catalog) {
      await disconnect(connector);
      const newConnection = { ...connector.connection, database: catalog };

      if (schema) {
        newConnection.schema = schema;
      }

      const newConnector = await connect(newConnection);

      connectors[connectorId] = newConnector;
      return;
    }

    assert(schema, 'Either catalog or schema is required to switch catalog/schema for Postgres');

    await connector.postgresPool.query(`SET search_path TO ${schema}`);

    connector.connection.schema = schema;
  }
};

export const disconnectDb: DisconnectDb = async (connectorId) => {
  if (!(connectorId in connectors)) return;

  await disconnect(connectors[connectorId]);

  if (import.meta.env.DEV) {
    console.info('Disconnected from', connectorId);
  }

  delete connectors[connectorId];
};

export const runQuery: RunQuery = async (props) => {
  const { connectorId, statements } = props;

  if (import.meta.env.DEV) {
    console.info(`Processing ${statements.length} queries`);
  }

  if (!(connectorId in connectors)) {
    throw new ConnectorNotFoundError();
  }

  const results = await runQueryFn(connectors[connectorId], statements);

  if (import.meta.env.DEV) {
    console.info('Executed queries', results.length);
  }

  return results;
};

export const getSqliteFile = async (
  mainWindow: BrowserWindow,
): Promise<ReturnType<GetSqliteFile>> => {
  // File picker for SQLite files
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Select SQLite Database File',
    filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    throw new Error('No file selected');
  }

  const fs = await import('fs/promises');
  const filePath = result.filePaths[0];
  const fileBuffer = await fs.readFile(filePath);
  const base64 = fileBuffer.toString('base64');
  const fileName = filePath.split(/[/\\]/).pop() || 'database.db';

  return { name: fileName, base64 };
};
