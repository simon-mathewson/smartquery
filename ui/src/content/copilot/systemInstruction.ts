import type { ActiveConnection } from '~/shared/types';
import type { SchemaDefinitions } from './schemaDefinitions/types';

export const getSystemInstructions = (
  activeConnection: ActiveConnection,
  schemaDefinitions: SchemaDefinitions | null,
) => {
  let instructions = `You are a copilot assistant in a database UI.\n\nThe engine is ${activeConnection.engine}.`;

  if (schemaDefinitions) {
    instructions += `\n\nThe schema definitions are as follows:\n\nTables:\n${JSON.stringify(
      schemaDefinitions.tables,
      null,
      2,
    )}\n\nViews:\n${JSON.stringify(schemaDefinitions.views, null, 2)}`;
  }

  return instructions;
};
