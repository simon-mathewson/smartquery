import { isAuthenticated } from '~/middlewares/isAuthenticated';
import { trpc } from '../trpc';
import { connectionSchema } from '@/connections/types';
import { z } from 'zod';
import { mapConnectionToPrisma, mapPrismaToConnection } from './mapPrisma';
import { createConnectionInputSchema, updateConnectionInputSchema } from './schemas';
import { encryptCredentials } from './encryptCredentials';
import { verifyPassword } from '~/auth/verifyPassword';
import assert from 'node:assert';
import { decryptCredentials } from './decryptCredentials';
import { prisma } from '~/prisma/client';

export const connectionsRouter = trpc.router({
  create: trpc.procedure
    .use(isAuthenticated)
    .input(createConnectionInputSchema)
    .mutation(async ({ input, ctx: { user } }) => {
      const prismaInput = await (async () => {
        const prismaInputUnencrypted = mapConnectionToPrisma(input.connection);

        if (
          input.connection.type === 'remote' &&
          input.connection.credentialStorage === 'encrypted'
        ) {
          assert(input.userPassword);
          await verifyPassword(user, input.userPassword);

          return encryptCredentials({
            connection: prismaInputUnencrypted,
            prisma,
            userId: user.id,
            userPassword: input.userPassword,
          });
        }

        return prismaInputUnencrypted;
      })();

      await prisma.connection.create({
        data: {
          userId: user.id,
          ...prismaInput,
        },
      });
    }),
  decryptCredentials: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string(), userPassword: z.string() }))
    .output(connectionSchema)
    .mutation(async ({ input, ctx: { user } }) => {
      const connection = await prisma.connection.findUniqueOrThrow({
        where: { id: input.id, userId: user.id },
      });

      return mapPrismaToConnection(
        await decryptCredentials({
          connection,
          prisma,
          userId: user.id,
          userPassword: input.userPassword,
        }),
      );
    }),
  delete: trpc.procedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx: { user } }) => {
      await prisma.connection.delete({
        where: { id: input.id, userId: user.id },
      });
    }),
  list: trpc.procedure
    .use(isAuthenticated)
    .output(z.array(connectionSchema))
    .query(async ({ ctx: { user } }) => {
      const connections = await prisma.connection.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return connections.map(mapPrismaToConnection);
    }),
  update: trpc.procedure
    .use(isAuthenticated)
    .input(updateConnectionInputSchema)
    .mutation(async ({ input, ctx: { user } }) => {
      const prismaInput = await (async () => {
        const prismaInputUnencrypted = mapConnectionToPrisma(input.connection);

        const existingConnection = await prisma.connection.findUniqueOrThrow({
          where: { id: input.connection.id, userId: user.id },
        });

        if (
          input.connection.type === 'remote' &&
          input.connection.credentialStorage === 'encrypted'
        ) {
          assert(input.userPassword);
          await verifyPassword(user, input.userPassword);

          return encryptCredentials({
            connection: prismaInputUnencrypted,
            existingConnection: existingConnection,
            prisma,
            userId: user.id,
            userPassword: input.userPassword,
          });
        }

        // When encryption gets removed from connection, decrypt those credentials which were not
        // changed
        if (input.connection.type === 'remote' && existingConnection.encryptCredentials) {
          assert(input.userPassword);
          await verifyPassword(user, input.userPassword);

          const decryptedConnection = await decryptCredentials({
            connection: existingConnection,
            prisma,
            userId: user.id,
            userPassword: input.userPassword,
          });

          return {
            ...prismaInputUnencrypted,
            password:
              input.connection.password === existingConnection.password
                ? decryptedConnection.password
                : input.connection.password,
            passwordNonce: null,
            sshPassword:
              input.connection.ssh &&
              input.connection.ssh.password === existingConnection.sshPassword
                ? decryptedConnection.sshPassword
                : input.connection.ssh?.password,
            sshPasswordNonce: null,
            sshPrivateKey:
              input.connection.ssh &&
              input.connection.ssh.privateKey === existingConnection.sshPrivateKey
                ? decryptedConnection.sshPrivateKey
                : input.connection.ssh?.privateKey,
            sshPrivateKeyNonce: null,
          };
        }

        return prismaInputUnencrypted;
      })();

      await prisma.connection.update({
        where: { id: input.connection.id, userId: user.id },
        data: prismaInput,
      });
    }),
});
