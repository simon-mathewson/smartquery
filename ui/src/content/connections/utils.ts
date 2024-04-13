export const getCredentialUsername = (connection: {
  user: string;
  host: string;
  port: number | null;
}) => `${connection.user}@${connection.host}:${connection.port}`;
