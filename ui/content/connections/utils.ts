export const getUserHandle = (props: { user: string; host: string; port: number }) =>
  `${props.user}@${props.host}:${props.port}`;

export const getCredentialId = (connection: { user: string; host: string; port: number }) =>
  `${connection.user}@${connection.host}:${connection.port}`;
