export type Plan = {
  webPrice: number | null;
  limits: {
    aiCredits: number;
  };
};

export const plans = {
  anonymous: {
    webPrice: null,
    limits: {
      aiCredits: 5, // $0.05
    },
  },
  free: {
    webPrice: null,
    limits: {
      aiCredits: 15, // $0.15
    },
  },
  plus: {
    webPrice: 4,
    limits: {
      aiCredits: 75, // $0.75
    },
  },
  pro: {
    webPrice: 16,
    limits: {
      aiCredits: 300, // $3.00
    },
  },
} satisfies Record<string, Plan>;

export type PlanLimits = Plan['limits'];
