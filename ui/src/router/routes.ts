export const routes = {
  root: '/',
  database: (connectionId = ':connectionId', database = ':database') =>
    `/conn/${connectionId}/db/${database}`,
};
