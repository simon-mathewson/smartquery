export const routes = {
  root: '/',
  database: (connectionId = ':connectionId', database = ':database') =>
    `/db/${connectionId}/${database}`,
};
