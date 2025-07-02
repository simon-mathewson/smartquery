import type { ActiveConnection } from '~/shared/types';
import type { SchemaDefinitions } from './schemaDefinitions/types';
import superjson from 'superjson';

export const getSystemInstructions = (
  activeConnection: ActiveConnection,
  schemaDefinitions: SchemaDefinitions | null,
) => {
  let instructions = `You are a copilot assistant in a database UI. Be concise.\n\nThe engine is ${activeConnection.engine}. When generating SQL, use quotes as necessary, particularly to ensure correct casing.`;

  if (schemaDefinitions) {
    instructions += `\n\nThe schema definitions are as follows:\n\n${superjson.stringify(
      schemaDefinitions.definitions,
    )}`;
  }

  return instructions;
};
