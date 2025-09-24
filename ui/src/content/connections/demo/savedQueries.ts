import type { SavedQuery } from '@/savedQueries/types';

export const demoSavedQueries = [
  {
    id: 'a14523cc-906b-407e-b0f2-b92fbf81ca46',
    name: 'Genre distribution',
    sql: 'SELECT\n  T1.Name AS Track,\n  T2.Name AS Genre\nFROM tracks AS T1\nINNER JOIN genres AS T2\n  ON T1.GenreId = T2.GenreId;',
    chart: { type: 'pie', xColumn: 'Genre', xTable: 'T2', yColumn: null, yTable: null },
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
      yTable: 'customers',
    },
  },
] satisfies SavedQuery[];
