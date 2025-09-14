export type Plan = {
  price: number | null;
  limits: {
    aiCredits: number;
    concurrentConnections: number;
    totalQueryDurationMilliseconds: number;
    totalQueryResponseBytes: number;
  };
};

export const plans = {
  free: {
    price: null,
    limits: {
      aiCredits: 100_000,
      concurrentConnections: 1,
      totalQueryDurationMilliseconds: 10 * 60 * 1000,
      totalQueryResponseBytes: 100 * 1024 * 1024,
    },
  },
  plus: {
    price: 8,
    limits: {
      aiCredits: 900_000,
      concurrentConnections: 3,
      totalQueryDurationMilliseconds: 60 * 60 * 1000,
      totalQueryResponseBytes: 1 * 1024 * 1024 * 1024,
    },
  },
  pro: {
    price: 18,
    limits: {
      aiCredits: 1_900_000,
      concurrentConnections: 8,
      totalQueryDurationMilliseconds: 6 * 60 * 60 * 1000,
      totalQueryResponseBytes: 12 * 1024 * 1024 * 1024,
    },
  },
} satisfies Record<string, Plan>;

export type PlanLimits = Plan['limits'];
