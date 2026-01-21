export const getSubscriptionTypeForAppleProductId = (productId: string) => {
  switch (productId) {
    case process.env.APPLE_PLUS_PRODUCT_ID:
      return 'plus';
    case process.env.APPLE_PRO_PRODUCT_ID:
      return 'pro';
    default:
      throw new Error(`Unknown Apple subscription product id: ${productId}`);
  }
};
