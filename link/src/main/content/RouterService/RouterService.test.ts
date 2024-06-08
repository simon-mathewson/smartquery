import Container from 'typedi';
import { beforeAll, beforeEach, test, describe, afterAll, expect } from 'vitest';
import { clientsToken } from './RouterService';
import { seed } from '../../test/utils/seed';
import { setUpServer } from '../../utils/setUpServer';
import { getTrpcClient } from '../../test/utils/getTrpcClient';

describe('router', () => {
  let server: ReturnType<typeof setUpServer>;
  let client: ReturnType<typeof getTrpcClient>;

  beforeAll(async () => {
    seed();

    Container.reset();

    server = setUpServer();

    client = getTrpcClient();
  });

  beforeEach(() => {
    Container.set(clientsToken, {});
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  describe('connectDb', () => {
    test('connects to the database', async () => {
      const response = await client.status.query();
      expect(response).toBe(true);
    });
  });

  // describe('disconnectDb', () => {
  //   test('disconnects from the database', async () => {
  //     // test code here
  //   });
  // });
});
