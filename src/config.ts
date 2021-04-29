/*
  Wrapper interface for all the env variables from .env
  Note that all vars on it need to be string based otherwise reading from the file will malfunction
*/
interface EnvVars {
  NODE_ENVIRONMENT: string;
  ALLOW_UNAUTHORIZED: 'true' | 'false';
  PORT: string;
  DATABASE_NAME: string;
  DATABASE_PORT: string;
  DATABASE_DROP: 'true' | 'false';
  DATABASE_DBG: 'true' | 'false';
  DATABASE_HOST?: string;
  DATABASE_PASS?: string;
  DATABASE_USER?: string;
  WEBHOOK_SECRET_KEY: string;
  JWT_SECRET_KEY?: string;

  isDev(): boolean;
  isTest(): boolean;
}

export const config: EnvVars = {
  NODE_ENVIRONMENT: 'development',
  ALLOW_UNAUTHORIZED: 'false',
  PORT: '5000',
  DATABASE_DROP: 'false',
  DATABASE_PORT: '3306',
  DATABASE_NAME: 'publisher_services_dev',
  DATABASE_DBG: 'true',
  WEBHOOK_SECRET_KEY: '63c114560dc2bb11ef28cdfbeab09724',
  isDev: () => {
    return config.NODE_ENVIRONMENT === 'development';
  },
  isTest: () => {
    return config.NODE_ENVIRONMENT === 'test';
  },
  ...process.env,
};

if (!config.DATABASE_HOST && !config.isTest()) {
  throw new Error('Missing DATABASE_HOST environment configuration');
}

if (!config.DATABASE_PASS && !config.isTest()) {
  throw new Error('Missing DATABASE_PASS environment configuration');
}

if (!config.DATABASE_USER && !config.isTest()) {
  throw new Error('Missing DATABASE_USER environment configuration');
}

if (!config.WEBHOOK_SECRET_KEY && !config.isTest()) {
  throw new Error('Missing WEBHOOK_SECRET_KEY environment configuration');
}

if (!config.JWT_SECRET_KEY && !config.isTest()) {
  throw new Error('Missing JWT_SECRET_KEY environment configuration');
}
