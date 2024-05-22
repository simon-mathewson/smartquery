export const routes = {
  root: () => '/',
  setup: () => '/setup',
  database: (connectionId = ':connectionId', database = ':database') =>
    `/db/${connectionId}/${database}`,
};
