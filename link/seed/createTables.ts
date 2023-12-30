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

  await prisma.$queryRawUnsafe(`
    CREATE TABLE users (
      id ${engine === 'postgresql' ? 'SERIAL' : 'INT NOT NULL AUTO_INCREMENT'},
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      role ${
        engine === 'postgresql' ? 'user_role' : 'ENUM("USER", "ADMIN")'
      } NOT NULL DEFAULT 'USER',
      attributes JSON NULL,
      PRIMARY KEY (id)
    )
  `);

  await prisma.$queryRawUnsafe(`
    CREATE TABLE posts (
      id VARCHAR(255) NOT NULL,
      text VARCHAR(255) NOT NULL,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      user_id INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$queryRawUnsafe(`
    CREATE TABLE user_favorite_posts (
      user_id INT NOT NULL,
      post_id VARCHAR(36) NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$disconnect();
};
