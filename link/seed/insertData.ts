import { createClient } from './createClient';
import { Connection } from './types';
import { faker } from '@faker-js/faker';

const isNotUndefined = <T>(value: T | undefined): value is T => value !== undefined;

export const insertData = async (connection: Connection) => {
  const prisma = await createClient(connection);

  const users = faker.helpers.multiple(() => ({
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['ADMIN', 'USER']),
    attributes: faker.helpers.arrayElement([
      `'{"favoriteNumber": ${faker.number.int()}, "favoriteColor": "${faker.color.human()}"}'`,
      `NULL`,
    ]),
  }));
  const userIds = users.map((_, index) => index + 1);

  await prisma.$queryRawUnsafe(`
    INSERT INTO users (name, role, attributes)
    VALUES
      ${users.map(({ name, role, attributes }) => `('${name}', '${role}', ${attributes})`).join()}
  `);

  const posts = faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      text: faker.lorem.sentence(),
      userId: faker.helpers.arrayElement(userIds),
    }),
    { count: 200 },
  );

  await prisma.$queryRawUnsafe(`
    INSERT INTO posts (id, text, user_id)
    VALUES
      ${posts.map(({ id, userId, text }) => `('${id}', '${text}', ${userId})`).join()}
  `);

  const userFavoritePosts = userIds
    .flatMap((userId) =>
      faker.helpers.maybe(() =>
        faker.helpers.multiple(() => ({
          userId,
          postId: faker.helpers.arrayElement(posts).id,
        })),
      ),
    )
    .filter(isNotUndefined);

  await prisma.$queryRawUnsafe(`
    INSERT INTO user_favorite_posts (user_id, post_id)
    VALUES
      ${userFavoritePosts.map(({ userId, postId }) => `(${userId}, '${postId}')`).join()}
  `);

  await prisma.$disconnect();
};
