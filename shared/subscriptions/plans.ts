export type Plan = {
  price: number | null;
  limits: {
    aiCredits: number;
  };
};

export const plans = {
  anonymous: {
    price: null,
    limits: {
      aiCredits: 10, // $0.10
    },
  },
  free: {
    price: null,
    limits: {
      aiCredits: 100, // $1.00
    },
  },
  plus: {
    price: 8,
    limits: {
      aiCredits: 500, // $5.00
    },
  },
  pro: {
    price: 18,
    limits: {
      aiCredits: 1200, // $12.00
    },
  },
} satisfies Record<string, Plan>;

export type PlanLimits = Plan['limits'];
