export const routes = {
  root: () => '/',
  setup: () => '/setup',
  database: (params?: { connectionId?: string; database?: string; schema?: string }) =>
    `/db/${params?.connectionId ?? ':connectionId'}/${params?.database ?? ':database'}${
      params?.schema !== '' ? `/${params?.schema ?? ':schema'}` : ''
    }`,
};
