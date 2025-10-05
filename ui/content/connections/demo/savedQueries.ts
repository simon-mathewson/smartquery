import type { SavedQuery } from '@/savedQueries/types';

export const demoSavedQueries = [
  {
    id: '65371258-b28b-4e01-b7fc-31368ce29b1d',
    name: 'Genre distribution',
    sql: 'SELECT\n  T1.Name,\n  COUNT(T2.TrackId) AS NumberOfTracks\nFROM genres AS T1\nINNER JOIN tracks AS T2\n  ON T1.GenreId = T2.GenreId\nGROUP BY\n  T1.Name\nORDER BY\n  NumberOfTracks DESC;',
    chart: {
      type: 'pie',
      xColumn: 'Name',
      xTable: 'T1',
      yColumn: 'NumberOfTracks',
      yTable: null,
    },
  },
  {
    id: 'a172e5c8-b4da-4b57-9a4d-28a91470c7d2',
    name: 'Purchase history',
    sql: 'SELECT * FROM "invoices" ORDER BY "invoices"."InvoiceDate" ASC LIMIT 100',
    chart: {
      type: 'line',
      xColumn: 'InvoiceDate',
      xTable: 'invoices',
      yColumn: 'Total',
      yTable: 'invoices',
    },
  },
  {
    id: 'c8fd33c9-692c-4e6d-be6d-fda0c7c84a2b',
    name: 'Top countries',
    sql: 'SELECT\n  Country,\n  COUNT(CustomerId) as CustomerCount\nFROM\n  customers\nGROUP BY\n  Country\nORDER BY\n  CustomerCount DESC;',
    chart: {
      type: 'bar',
      xColumn: 'Country',
      xTable: 'customers',
      yColumn: 'CustomerCount',
      yTable: null,
    },
  },
] satisfies SavedQuery[];
