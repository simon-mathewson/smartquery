export type Plan = {
  price: {
    eur: number;
    usd: number;
  } | null;
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
      concurrentQueryStatements: 1,
      totalQueryDurationMilliseconds: 15 * 60 * 1000,
      totalQueryResponseBytes: 250 * 1024 * 1024,
    },
  },
  plus: {
    price: {
      eur: 8,
      usd: 9,
    },
    limits: {
      aiCredits: 900_000,
      concurrentConnections: 3,
      concurrentQueryStatements: 2,
      totalQueryDurationMilliseconds: 2 * 60 * 60 * 1000,
      totalQueryResponseBytes: 4 * 1024 * 1024 * 1024,
    },
  },
  pro: {
    price: {
      eur: 18,
      usd: 19,
    },
    limits: {
      aiCredits: 1_900_000,
      concurrentConnections: 8,
      concurrentQueryStatements: 5,
      totalQueryDurationMilliseconds: 6 * 60 * 60 * 1000,
      totalQueryResponseBytes: 12 * 1024 * 1024 * 1024,
    },
  },
} satisfies Record<string, Plan>;
