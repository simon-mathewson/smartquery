export const routes = {
  addConnection: () => '/add-connection',
  connection: (params?: { connectionId?: string; database?: string; schema?: string }) =>
    `/conn/${params?.connectionId ?? ':connectionId'}${
      params?.database !== '' ? `/${params?.database ?? ':database'}` : ''
    }${params?.schema !== '' ? `/${params?.schema ?? ':schema'}` : ''}`,
  demo: () => '/demo',
  login: () => '/login',
  root: () => '/',
  signup: () => '/signup',
};
