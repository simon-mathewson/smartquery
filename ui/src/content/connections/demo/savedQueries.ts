import { v4 as uuid } from 'uuid';

export const demoSavedQueries = [
  {
    id: uuid(),
    name: 'Invoice totals per customer',
    sql: 'SELECT\n  T1.FirstName,\n  T1.LastName,\n  SUM(T2.Total) AS TotalInvoices\nFROM customers AS T1\nINNER JOIN invoices AS T2\n  ON T1.CustomerId = T2.CustomerId\nGROUP BY\n  T1.CustomerId\nORDER BY\n  T1.FirstName,\n  T1.LastName;',
  },
];
