export type Query = {
  columns: string[];
  hasResults: boolean;
  id: string;
  rows: Array<Record<string, string | Date>>;
  showEditor: boolean;
  sql: string | null;
  table: string | null;
};

export type QueryToAdd = {
  sql?: string;
  showEditor?: boolean;
  table?: string;
};

export type QueriesState = {
  queries: Query[][];
};
