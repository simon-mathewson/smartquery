export const routes = {
  addConnection: () => '/add-connection',
  database: (params?: { connectionId?: string; database?: string; schema?: string }) =>
    `/db/${params?.connectionId ?? ':connectionId'}${
      params?.database !== '' ? `/${params?.database ?? ':database'}` : ''
    }${params?.schema !== '' ? `/${params?.schema ?? ':schema'}` : ''}`,
  root: () => '/',
  signup: () => '/signup',
};
