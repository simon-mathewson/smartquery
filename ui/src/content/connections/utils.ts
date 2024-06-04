export const getCredentialUsername = (connection: { user: string; host: string; port: number }) =>
  `${connection.user}@${connection.host}:${connection.port}`;
