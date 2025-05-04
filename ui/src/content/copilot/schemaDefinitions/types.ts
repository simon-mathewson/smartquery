export type SchemaDefinitions = {
  createdAt: Date;
  tables: Record<string, unknown>[];
  views: Record<string, unknown>[];
};
