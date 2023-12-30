import { createClient } from './createClient';
import { Connection } from './types';

export const insertData = async (connection: Connection) => {
  const prisma = await createClient(connection);

  await prisma.$queryRawUnsafe(`
    INSERT INTO users (name, role, attributes)
    VALUES
      ('Alice', 'USER', '{"favoriteNumber": 0, "favoriteColor": "black"}'),
      ('Bob', 'ADMIN', NULL),
      ('Carol', 'USER', '{"favoriteNumber": 42, "favoriteColor": "red"}')
  `);

  await prisma.$queryRawUnsafe(`
    INSERT INTO posts (id, text, user_id)
    VALUES
      ('10f5054b-c670-4caa-a4cc-63d347db0bf5', 'Hello, world!', 1),
      ('bb33e510-5b23-4a3e-8778-409680ffe101', 'Today is a good day.', 2),
      ('92b4c280-bccd-4c94-b1c5-e3fb010f1391', 'I like Prisma.', 3)
  `);

  await prisma.$queryRawUnsafe(`
    INSERT INTO user_favorite_posts (user_id, post_id)
    VALUES
      (1, '10f5054b-c670-4caa-a4cc-63d347db0bf5'),
      (1, 'bb33e510-5b23-4a3e-8778-409680ffe101'),
      (2, 'bb33e510-5b23-4a3e-8778-409680ffe101'),
      (3, '92b4c280-bccd-4c94-b1c5-e3fb010f1391')
  `);

  await prisma.$disconnect();
};
