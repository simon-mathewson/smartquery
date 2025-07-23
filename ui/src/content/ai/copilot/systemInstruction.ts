import type { ActiveConnection } from '~/shared/types';

export const getSystemInstructions = (
  activeConnection: ActiveConnection,
  schemaDefinitionsInstruction: string | null,
) => {
  let instructions = `You are a copilot assistant in a database UI.\n\nThe engine is ${activeConnection.engine}. When generating SQL, use quotes as necessary, particularly to ensure correct casing.`;

  if (schemaDefinitionsInstruction) {
    instructions += `\n\n${schemaDefinitionsInstruction}`;
  }

  return instructions;
};
