import { createClient } from './createClient';
import { Connection } from './types';

export const createTables = async (connection: Connection) => {
  const { engine } = connection;

  const prisma = await createClient(connection);

  if (engine === 'postgresql') {
    await prisma.$queryRaw`
      CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
    `;
  }

  const datetimeType = engine === 'sqlserver' ? 'DATETIME' : 'TIMESTAMP';

  await prisma.$queryRawUnsafe(`
    CREATE TABLE users (
      id ${
        {
          mysql: 'INT NOT NULL AUTO_INCREMENT',
          postgresql: 'SERIAL',
          sqlserver: 'INT IDENTITY(1,1)',
        }[engine]
      },
      name VARCHAR(255) NOT NULL,
      created_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at ${datetimeType} NOT NULL DEFAULT CURRENT_TIMESTAMP,
      role ${
        {
          mysql: 'ENUM("USER", "ADMIN")',
          postgresql: 'user_role',
          sqlserver: 'VARCHAR(50)',
        }[engine]
      } NOT NULL DEFAULT 'USER',
      attributes ${engine === 'sqlserver' ? 'VARCHAR(255)' : 'JSON'} NULL,
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
      is_published ${engine === 'postgresql' ? 'BOOLEAN' : 'TINYINT'} NOT NULL DEFAULT ${
        engine === 'postgresql' ? 'FALSE' : '0'
      },
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

  await prisma.$disconnect();
};
