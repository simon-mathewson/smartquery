export const routes = {
  root: () => '/',

  addConnection: () => '/add-connection',
  connection: (params?: { connectionId?: string; database?: string; schema?: string }) =>
    `/conn/${params?.connectionId ?? ':connectionId'}${
      params?.database !== '' ? `/${params?.database ?? ':database'}` : ''
    }${params?.schema !== '' ? `/${params?.schema ?? ':schema'}` : ''}`,

  login: () => '/login',
  signup: () => '/signup',
  verifyEmail: () => '/verify-email',
  requestResetPassword: (email?: string) =>
    `/request-reset-password${email ? `?email=${email}` : ''}`,
  resetPassword: () => '/reset-password',

  connectToPostgres: () => '/connect-to-postgres',
  connectToMysql: () => '/connect-to-mysql',
  openSqlite: () => '/open-sqlite',

  demo: () => '/conn/demo/demo',
};
