import type { Connector, DbValue, Results } from './types';

export const runQuery = async (connector: Connector, statements: string[]): Promise<Results> => {
  if ('mysqlPool' in connector) {
    const client = await connector.mysqlPool.getConnection();

    try {
      await client.query('START TRANSACTION');

      const results = await Promise.all(
        statements.map((statement) =>
          client.query({
            sql: statement,
            rowsAsArray: true,
            // Prevent type casting, we only want strings and nulls (causes timezone issues when
            // converting to Date)
            typeCast: (field) => field.string(),
          }),
        ),
      );

      await client.query('COMMIT');

      return results.map(([rows, fields]) => {
        if (!Array.isArray(rows)) return { fields: [], rows: [] };

        return {
          fields: fields.map((field) => {
            const isColumn = field.orgName.length > 0;

            if (isColumn) {
              return {
                type: 'column',
                name: field.name,
                ref: {
                  column: field.orgName,
                  schema: field.schema,
                  table: field.orgTable,
                },
              };
            }

            return {
              type: 'virtual',
              name: field.name,
            };
          }),
          rows: rows as DbValue[][],
        };
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  if ('postgresPool' in connector) {
    const client = await connector.postgresPool.connect();

    try {
      await client.query('BEGIN');

      const results = await Promise.all(
        statements.map((statement) =>
          client.query({
            text: statement,
            rowMode: 'array',
            types: {
              getTypeParser: () => (v: unknown) => v,
            },
          }),
        ),
      );

      await client.query('COMMIT');

      return results.map((result) => ({
        rows: result.rows,
        fields: result.fields.map((field) => {
          if (field.columnID === 0) {
            return {
              type: 'virtual',
              name: field.name,
            };
          }

          return {
            type: 'column',
            name: field.name,
            ref: {
              columnId: field.columnID,
              tableId: field.tableID,
            },
          };
        }),
      }));
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  throw new Error('Unsupported connector type');
};
