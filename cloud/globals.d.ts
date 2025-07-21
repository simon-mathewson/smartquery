declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    SES_EMAIL_IDENTITY_ARN?: string;
    UI_URL: string;
  }
}
