import { PrismaClient } from '../generated';

(async () => {
  console.info('Seeding database...');

  const prisma = new PrismaClient();

  await prisma.user.create({
    data: {
      dataEncryptionKey: 'JMW5jrHfuIahAyPawM/AnnnuHu/eWhOafFdYLrximnr+/I/ZUAdsIa32Ow1gFIiD',
      dataEncryptionKeyNonce: 'HjF1wiq/y4aXzIjyDn/wqZR9J8qcrykl',
      email: 'test@dabase.dev',
      password:
        'aa5479096e6a5404c38cf600864d7e1e426e12abbd8aa7bc3f0d973fb2128accc16cbd1679ea9ad46d1ecf14675c1f140a30e5c9f65c83059220adca96837f28',
      passwordSalt: 'd2784477c24db928791a24d1fa954e06',
    },
  });

  console.info('Seeding complete.');
})();
