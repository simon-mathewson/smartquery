import type { PrismaClient } from '~/prisma/generated';
import type { JWSTransactionDecodedPayload } from '@apple/app-store-server-library';
import assert from 'assert';

export const revokeAppleSubscription = async (props: {
  prisma: PrismaClient;
  transactionInfo: JWSTransactionDecodedPayload;
}) => {
  const {
    prisma,
    transactionInfo: { originalTransactionId, revocationDate },
  } = props;

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUniqueOrThrow({
      where: {
        appleOriginalTransactionId: originalTransactionId,
      },
      include: { activeForUser: true },
    });

    if (!subscription.activeForUser) {
      console.warn(
        `Subscription already inactive for Apple originalTransactionId: ${originalTransactionId}`,
      );
      return;
    }

    assert(revocationDate, 'Revocation date is required');

    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        activeForUser: { disconnect: true },
        endDate: new Date(revocationDate),
      },
    });
  });
};
