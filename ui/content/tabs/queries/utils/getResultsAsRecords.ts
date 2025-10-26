import type { DbValue, Field } from '@/connector/types';

export const getResultsAsRecords = (
  result: { fields: Field[]; rows: DbValue[][] },
  options?: {
    /** Needed to normalize information schema results (MySQL uses uppercase, Postgres lowercase) */
    convertFieldNameToLowerCase?: boolean;
  },
) => {
  const { fields, rows } = result;
  const { convertFieldNameToLowerCase = false } = options ?? {};

  return rows.map((row) => {
    // Reduce right to keep first field if there are duplicates.
    return fields.reduceRight(
      (acc, field, index) => {
        const fieldName = convertFieldNameToLowerCase ? field.name.toLowerCase() : field.name;
        acc[fieldName] = row[index];
        return acc;
      },
      {} as Record<string, DbValue>,
    );
  });
};
