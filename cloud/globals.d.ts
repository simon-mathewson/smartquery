declare namespace NodeJS {
  interface ProcessEnv {
    AWS_REGION?: string;
    DATABASE_URL: string;
    GOOGLE_AI_API_KEY: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    SES_EMAIL_IDENTITY_ARN?: string;
    UI_URL: string;
  }
}
