declare namespace NodeJS {
  interface ProcessEnv {
    DABASE_CLOUD_DB_ENDPOINT?: string;
    DABASE_CLOUD_DB_SECRET_ARN?: string;
    DATABASE_URL?: string;
    JWT_SECRET: string;
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    UI_URL: string;
  }
}
