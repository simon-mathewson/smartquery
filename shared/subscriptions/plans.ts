export type Plan = {
  price: number | null;
  limits: {
    aiCredits: number;
    concurrentConnections: number;
    concurrentQueryStatements: number;
    totalQueryDurationMilliseconds: number;
    totalQueryResponseBytes: number;
  };
};

export const plans = {
  free: {
    price: null,
    limits: {
      aiCredits: 10_000,
      concurrentConnections: 1,
      concurrentQueryStatements: 2,
      totalQueryDurationMilliseconds: 10 * 60 * 1000,
      totalQueryResponseBytes: 100 * 1024 * 1024,
    },
  },
  plus: {
    price: 8,
    limits: {
      aiCredits: 900_000,
      concurrentConnections: 3,
      concurrentQueryStatements: 5,
      totalQueryDurationMilliseconds: 60 * 60 * 1000,
      totalQueryResponseBytes: 1 * 1024 * 1024 * 1024,
    },
  },
  pro: {
    price: 18,
    limits: {
      aiCredits: 1_900_000,
      concurrentConnections: 8,
      concurrentQueryStatements: 10,
      totalQueryDurationMilliseconds: 6 * 60 * 60 * 1000,
      totalQueryResponseBytes: 12 * 1024 * 1024 * 1024,
    },
  },
} satisfies Record<string, Plan>;

export type PlanLimits = Plan['limits'];
