import { createClient } from './createClient';
import type { Connection } from './types';

export const createTables = async (connection: Connection) => {
  const { engine } = connection;

  const prisma = await createClient(connection);

  if (engine === 'postgres') {
    await prisma.$queryRaw`
      CREATE TYPE test_enum AS ENUM ('Alpha', 'Beta', 'Charlie');
    `;
    await prisma.$queryRaw`
      CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
    `;
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

  await prisma.$queryRawUnsafe(`
    CREATE TABLE data_types (
      id ${intAutoIncrementType},
      text_column TEXT NOT NULL,
      text_column_nullable TEXT NULL,
      boolean_column ${booleanType} NOT NULL,
      boolean_column_nullable ${booleanType} NULL,
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
  `);

  await prisma.$queryRawUnsafe(`
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
  `);

  await prisma.$queryRawUnsafe(`
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
  `);

  await prisma.$queryRawUnsafe(`
    CREATE TABLE user_favorite_posts (
      user_id INT NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$queryRawUnsafe(`
    CREATE TABLE simple (
      id INT NOT NULL,
      PRIMARY KEY (id)
    )
  `);

  await prisma.$queryRawUnsafe(`
    CREATE TABLE many (
      id ${intAutoIncrementType},
      text TEXT NOT NULL,
      PRIMARY KEY (id)
    )
  `);

  await prisma.$disconnect();
};
