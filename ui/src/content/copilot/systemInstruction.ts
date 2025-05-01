import type { ActiveConnection } from '~/shared/types';

export const getCopilotSystemInstruction = (activeConnection: ActiveConnection) =>
  `You are a copilot assistant in a database UI. The engine is ${activeConnection.engine}.`;
