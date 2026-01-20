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
      aiCredits: 5, // $0.05
    },
  },
  free: {
    price: null,
    limits: {
      aiCredits: 15, // $0.15
    },
  },
  plus: {
    price: 4,
    limits: {
      aiCredits: 75, // $0.75
    },
  },
  pro: {
    price: 16,
    limits: {
      aiCredits: 300, // $3.00
    },
  },
} satisfies Record<string, Plan>;

export type PlanLimits = Plan['limits'];
