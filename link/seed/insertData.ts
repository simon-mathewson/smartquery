import { createClient } from './createClient';
import { Connection } from './types';
import { faker } from '@faker-js/faker';

const isNotUndefined = <T>(value: T | undefined): value is T => value !== undefined;

export const insertData = async (connection: Connection) => {
  const { engine } = connection;

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

  const getBooleanSqlValue = (value: boolean | null) => {
    if (value === null) return 'NULL';

    return engine === 'postgresql' ? value : Number(value);
  };

  await prisma.$queryRawUnsafe(`
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
