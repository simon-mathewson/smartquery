declare namespace NodeJS {
  interface ProcessEnv {
    AWS_REGION?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    OPENAI_API_KEY: string;
    PORT?: string;
    SES_EMAIL_IDENTITY_ARN?: string;
    STRIPE_API_KEY: string;
    STRIPE_PLUS_PRICE_ID: string;
    STRIPE_PLUS_PRODUCT_ID: string;
    STRIPE_PRO_PRICE_ID: string;
    STRIPE_PRO_PRODUCT_ID: string;
    STRIPE_WEBHOOK_SECRET: string;
    UI_URL: string;
  }
}
