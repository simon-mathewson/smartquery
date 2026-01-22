import assert from 'assert';
import type { PrismaClient } from '~/prisma/generated';
import { getSubscriptionTypeForAppleProductId } from '@/subscriptions/getSubscriptionTypeForAppleProductId';
import type { JWSTransactionDecodedPayload } from '@apple/app-store-server-library';

export const grantAppleSubscription = async (props: {
  prisma: PrismaClient;
  transactionInfo: JWSTransactionDecodedPayload;
}) => {
  const {
    prisma,
    transactionInfo: {
      appAccountToken,
      originalTransactionId,
      productId,
      purchaseDate,
      transactionId,
    },
  } = props;

  await prisma.$transaction(async (tx) => {
    assert(originalTransactionId, 'Original transaction ID is required');
    assert(appAccountToken, 'App account token is required');
    const userId = appAccountToken;

    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      include: { activeSubscription: true, subscriptions: true },
    });

    if (user.activeSubscription?.appleOriginalTransactionId === originalTransactionId) {
      console.warn(
        `Subscription already active for Apple originalTransactionId: ${originalTransactionId}`,
      );
      return;
    }

    assert(!user.activeSubscription, 'User already has a different active subscription');

    assert(purchaseDate, 'Purchase date is required');

    assert(productId, 'Product ID is required');
    const newSubscriptionType = getSubscriptionTypeForAppleProductId(productId);

    const existingSubscription = user.subscriptions.find(
      (subscription) => subscription.appleOriginalTransactionId === originalTransactionId,
    );

    if (existingSubscription && !user.activeSubscription) {
      console.info(
        `Reactivating existing subscription for Apple originalTransactionId: ${originalTransactionId}`,
      );
      await tx.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          activeForUser: { connect: { id: user.id } },
          endDate: null,
        },
      });
      return;
    }

    await tx.subscription.create({
      data: {
        activeForUser: { connect: { id: user.id } },
        appleOriginalTransactionId: originalTransactionId,
        appleTransactionId: transactionId,
        startDate: new Date(purchaseDate),
        type: newSubscriptionType,
        userId: user.id,
      },
    });
  });
};
