import type { ActiveConnection } from '~/shared/types';

export const getCopilotSystemInstruction = (
  activeConnection: ActiveConnection,
  schemaDefinitions: { tables: Record<string, unknown>[]; views: Record<string, unknown>[] },
) =>
  `You are a copilot assistant in a database UI.\n\nThe engine is ${
    activeConnection.engine
  }.\n\nThe schema definitions are as follows:\n\nTables:\n${JSON.stringify(
    schemaDefinitions.tables,
    null,
    2,
  )}\n\nViews:\n${JSON.stringify(schemaDefinitions.views, null, 2)}`;
