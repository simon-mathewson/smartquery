import type { RemoteConnection } from '@/connections/types';
import { disconnect } from '@/connector/disconnect';
import { connect } from '@/connector/connect';
import { faker } from '@faker-js/faker';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const insertData = async (connection: RemoteConnection) => {
  const connector = await connect(connection);

  const { engine } = connector.connection;

  const getBooleanSqlValue = (value: boolean | null) => {
    if (value === null) return 'NULL';

    return engine === 'postgres' ? value : Number(value);
  };

  try {
    const insertDataTypesQuery = `
      INSERT INTO data_types (
        text_column,
        text_column_nullable,
        boolean_column,
        boolean_column_nullable,
        date_column,
        date_column_nullable,
        datetime_column,
        datetime_column_nullable,
        datetime_with_time_zone_column,
        datetime_with_time_zone_column_nullable,
        time_column,
        time_column_nullable,
        int_column,
        int_column_nullable,
        decimal_column,
        decimal_column_nullable,
        enum_column,
        enum_column_nullable,
        json_column,
        json_column_nullable
      ) VALUES (
        'text',
        NULL,
        ${getBooleanSqlValue(true)},
        NULL,
        '2025-01-01',
        NULL,
        CURRENT_TIMESTAMP,
        NULL,
        CURRENT_TIMESTAMP,
        NULL,
        '12:34:56',
        NULL,
        123,
        NULL,
        123.45,
        NULL,
        'Alpha',
        NULL,
        '{"key": "value"}',
        NULL
      )
    `;

    if ('mysqlPool' in connector) {
      await connector.mysqlPool.query(insertDataTypesQuery);
    } else if ('postgresPool' in connector) {
      await connector.postgresPool.query(insertDataTypesQuery);
    }

    const users = faker.helpers.multiple(() => ({
      name: faker.person.fullName().replace(/'/g, "''"),
      role: faker.helpers.arrayElement(['ADMIN', 'USER']),
      attributes: faker.helpers.arrayElement([
        `'{"favoriteNumber": ${faker.number.int()}, "favoriteColor": "${faker.color.human()}"}'`,
        `NULL`,
      ]),
    }));
    const userIds = users.map((_, index) => index + 1);

    const insertUsersQuery = `
      INSERT INTO users (name, role, attributes)
      VALUES
        ${users.map(({ name, role, attributes }) => `('${name}', '${role}', ${attributes})`).join()}
    `;

    if ('mysqlPool' in connector) {
      await connector.mysqlPool.query(insertUsersQuery);
    } else if ('postgresPool' in connector) {
      await connector.postgresPool.query(insertUsersQuery);
    }

    const posts = faker.helpers.multiple(
      () => ({
        id: faker.string.uuid(),
        text: faker.lorem.sentence(),
        userId: faker.helpers.arrayElement(userIds),
        title: faker.lorem.sentence(),
        isPublished: faker.datatype.boolean(),
        isDeleted: faker.helpers.arrayElement([true, false, null]),
        internalNote1: faker.helpers.maybe(() => faker.lorem.sentence()),
        internalNote2: faker.helpers.maybe(() => faker.lorem.sentence()),
        internalNote3: faker.helpers.maybe(() => faker.lorem.sentence()),
        internalNote4: faker.helpers.maybe(() => faker.lorem.sentence()),
      }),
      { count: 200 },
    );

    const insertPostsQuery = `
      INSERT INTO posts (id, text, user_id, title, is_published, is_deleted, internal_note_1, internal_note_2, internal_note_3, internal_note_4)
      VALUES
        ${posts
          .map(
            ({
              id,
              userId,
              text,
              title,
              isPublished,
              isDeleted,
              internalNote1,
              internalNote2,
              internalNote3,
              internalNote4,
            }) =>
              `('${id}', '${text}', ${userId}, '${title}', ${getBooleanSqlValue(
                isPublished,
              )}, ${getBooleanSqlValue(isDeleted)}, ${
                internalNote1 ? `'${internalNote1}'` : 'NULL'
              }, ${internalNote2 ? `'${internalNote2}'` : 'NULL'}, ${
                internalNote3 ? `'${internalNote3}'` : 'NULL'
              }, ${internalNote4 ? `'${internalNote4}'` : 'NULL'})`,
          )
          .join()}
    `;

    if ('mysqlPool' in connector) {
      await connector.mysqlPool.query(insertPostsQuery);
    } else if ('postgresPool' in connector) {
      await connector.postgresPool.query(insertPostsQuery);
    }

    const userFavoritePosts = userIds.flatMap((userId) => [
      {
        userId,
        postId: posts[0].id,
      },
      {
        userId,
        postId: posts[1].id,
      },
    ]);

    const insertUserFavoritePostsQuery = `
      INSERT INTO user_favorite_posts (user_id, post_id)
      VALUES
        ${userFavoritePosts.map(({ userId, postId }) => `(${userId}, '${postId}')`).join()}
    `;

    const insertSimpleQuery = `
      INSERT INTO simple (id)
      VALUES
        (1), (2), (3)
    `;

    const manyTableData = JSON.parse(
      readFileSync(join(__dirname, 'manyTableData.json'), 'utf8'),
    ) as {
      id: number;
      text: string;
    }[];

    const insertManyQuery = `
      INSERT INTO many (text)
      VALUES
        ${Array(1000)
          .fill(0)
          .map(() => manyTableData.map((text) => `('${text}')`).join())}
    `;

    const insertNoPrimaryKeyQuery = `
      INSERT INTO no_primary_key (id, text)
      VALUES ('1', 'text')
    `;

    const remainingQueries = [
      insertUserFavoritePostsQuery,
      insertSimpleQuery,
      insertManyQuery,
      insertNoPrimaryKeyQuery,
    ];

    for (const query of remainingQueries) {
      if ('mysqlPool' in connector) {
        await connector.mysqlPool.query(query);
      } else if ('postgresPool' in connector) {
        await connector.postgresPool.query(query);
      }
    }
  } finally {
    await disconnect(connector);
  }
};
