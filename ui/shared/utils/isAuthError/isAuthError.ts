export const isAuthError = (error: unknown) =>
  error instanceof Error && error.message.includes('Authentication failed');
