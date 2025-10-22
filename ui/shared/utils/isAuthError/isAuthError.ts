export const isAuthError = (error: unknown) =>
  error instanceof Error &&
  (error.message.startsWith('Access denied for user ') ||
    error.message.startsWith('Cannot parse privateKey: ') ||
    error.message.startsWith('password authentication failed for user ') ||
    error.message === 'All configured authentication methods failed');
