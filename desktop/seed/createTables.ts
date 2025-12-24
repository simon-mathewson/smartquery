import type { RemoteConnection } from '@/connections/types';
import { connect } from '@/connector/connect';
import { disconnect } from '@/connector/disconnect';

export const createTables = async (connection: RemoteConnection) => {
  const connector = await connect(connection);

  const { engine } = connector.connection;

  try {
    if ('postgresPool' in connector) {
      await connector.postgresPool.query(`
        CREATE TYPE test_enum AS ENUM ('Alpha', 'Beta', 'Charlie');
      `);
      await connector.postgresPool.query(`
        CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
      `);
    }

    const booleanType = engine === 'postgres' ? 'BOOLEAN' : 'TINYINT';
    const datetimeType = engine === 'postgres' ? 'TIMESTAMP' : 'DATETIME';
    const datetimeWithTimeZoneType = {
      mysql: 'DATETIME',
      postgres: 'TIMESTAMP WITH TIME ZONE',
    }[engine];
    const intAutoIncrementType = {
      mysql: 'INT NOT NULL AUTO_INCREMENT',
      postgres: 'SERIAL',
    }[engine];

    const createDataTypesQuery = `
      CREATE TABLE data_types (
        id ${intAutoIncrementType},
        text_column TEXT NOT NULL,
        text_column_nullable TEXT NULL,
        boolean_column ${booleanType} NOT NULL,
        boolean_column_nullable ${booleanType} NULL,
        date_column DATE NOT NULL,
        date_column_nullable DATE NULL,
        datetime_column ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        datetime_column_nullable ${datetimeType} NULL,
        datetime_with_time_zone_column ${datetimeWithTimeZoneType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        datetime_with_time_zone_column_nullable ${datetimeWithTimeZoneType} NULL,
        time_column TIME NOT NULL,
        time_column_nullable TIME NULL,
        int_column INT NOT NULL,
        int_column_nullable INT NULL,
        decimal_column DECIMAL(5,2) NOT NULL,
        decimal_column_nullable DECIMAL(5,2) NULL,
        enum_column ${
          {
            mysql: 'ENUM("Alpha", "Beta", "Charlie")',
            postgres: 'test_enum',
          }[engine]
        } NOT NULL,
        enum_column_nullable ${
          {
            mysql: 'ENUM("Alpha", "Beta", "Charlie")',
            postgres: 'test_enum',
          }[engine]
        } NULL,
        json_column JSON NOT NULL,
        json_column_nullable JSON NULL,
        PRIMARY KEY (id)
      )
    `;

    if ('mysqlPool' in connector) {
      await connector.mysqlPool.query(createDataTypesQuery);
    } else if ('postgresPool' in connector) {
      await connector.postgresPool.query(createDataTypesQuery);
    }

    const createUsersQuery = `
      CREATE TABLE users (
        id ${
          {
            mysql: 'INT NOT NULL AUTO_INCREMENT',
            postgres: 'SERIAL',
          }[engine]
        },
        name VARCHAR(255) NOT NULL,
        created_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        role ${
          {
            mysql: 'ENUM("USER", "ADMIN")',
            postgres: 'user_role',
          }[engine]
        } NOT NULL DEFAULT 'USER',
        attributes JSON NULL,
        PRIMARY KEY (id)
      )
    `;

    const createPostsQuery = `
      CREATE TABLE posts (
        id VARCHAR(36) NOT NULL,
        text VARCHAR(255) NOT NULL,
        created_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        is_published ${booleanType} NOT NULL DEFAULT ${engine === 'postgres' ? 'FALSE' : '0'},
        is_deleted ${booleanType} NULL,
        internal_note_1 VARCHAR(255) NULL,
        internal_note_2 VARCHAR(255) NULL,
        internal_note_3 VARCHAR(255) NULL,
        internal_note_4 VARCHAR(255) NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    const createUserFavoritePostsQuery = `
      CREATE TABLE user_favorite_posts (
        user_id INT NOT NULL,
        post_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
        FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;

    const createSimpleQuery = `
      CREATE TABLE simple (
        id INT NOT NULL,
        PRIMARY KEY (id)
      )
    `;

    const createManyQuery = `
      CREATE TABLE many (
        id ${intAutoIncrementType},
        text TEXT NOT NULL,
        PRIMARY KEY (id)
      )
    `;

    const createNoPrimaryKeyQuery = `
      CREATE TABLE no_primary_key (
        id ${intAutoIncrementType} UNIQUE,
        text TEXT NOT NULL
      )
    `;

    const queries = [
      createUsersQuery,
      createPostsQuery,
      createUserFavoritePostsQuery,
      createSimpleQuery,
      createManyQuery,
      createNoPrimaryKeyQuery,
    ];

    for (const query of queries) {
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
