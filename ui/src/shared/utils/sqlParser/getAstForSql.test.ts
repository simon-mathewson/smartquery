import { describe, expect, test } from 'vitest';
import { getAstForSql } from './getAstForSql';

const mysqlSelectStatement = `
  SELECT * FROM \`users\`
  JOIN \`posts\` ON \`users\`.\`id\` = \`posts\`.\`user_id\`
  WHERE \`users\`.\`id\` = 1
  ORDER BY \`users\`.\`id\` ASC
  LIMIT 1
`;

const postgresSelectStatement = `
  SELECT * FROM "users"
  JOIN "posts" ON "users"."id" = "posts"."user_id"
  WHERE "users"."id" = 1
  ORDER BY "users"."id" ASC
  LIMIT 1
`;

describe('getAstForSql', () => {
  describe('parses SQL select statement', () => {
    test('MySQL', async () => {
      expect(
        await getAstForSql({ engine: 'mysql', statement: mysqlSelectStatement }),
      ).toMatchSnapshot();
    });

    test('PostgreSQL', async () => {
      expect(
        await getAstForSql({ engine: 'postgres', statement: postgresSelectStatement }),
      ).toMatchSnapshot();
    });
  });

  test('returns null for invalid SQL', async () => {
    expect(
      await getAstForSql({
        engine: 'mysql',
        skipLogging: true,
        statement: postgresSelectStatement,
      }),
    ).toBeNull();
  });

  test('parses first statement if multiple statements are provided', async () => {
    const testKeyword = 'TEST123';

    const ast = await getAstForSql({
      engine: 'mysql',
      statement: `${mysqlSelectStatement}; SELECT * FROM \`${testKeyword}\``,
    });

    expect(JSON.stringify(ast)).not.toContain(testKeyword);
  });
});
