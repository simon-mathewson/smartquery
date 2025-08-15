export const getSubscriptionTypeForProductId = (productId: string) => {
  switch (productId) {
    case process.env.STRIPE_PLUS_PRODUCT_ID:
      return 'plus';
    case process.env.STRIPE_PRO_PRODUCT_ID:
      return 'pro';
    default:
      throw new Error(`Unknown subscription product id: ${productId}`);
  }
};
