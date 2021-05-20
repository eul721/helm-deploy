/*
  Wrapper interface for all the env variables from .env or in case of tests from TestEnv in jest.config.js
  Note that all vars on it need to be string based otherwise reading from the file will malfunction
*/
interface EnvVars {
  NODE_ENVIRONMENT: string;
  ALLOW_UNAUTHORIZED: 'true' | 'false';
  BINARY_DISTRIBUTION_SERVICE_URL: string;
  DNA_AUTH_TOKEN: string;
  DNA_APP_ID: string;
  DNA_DISCOVERY_URL: string;
  CLIENT_VERSION: string;
  PORT: string;
  DATABASE_NAME: string;
  DATABASE_PORT: string;
  DATABASE_DROP: 'true' | 'false';
  DATABASE_DBG: 'true' | 'false';
  DATABASE_HOST?: string;
  DATABASE_PASS?: string;
  DATABASE_USER?: string;
  WEBHOOK_SECRET_KEY?: string;
  JWT_SECRET_KEY?: string;
  isDev(): boolean;
  isTest(): boolean;
}

export const envConfig: EnvVars = {
  NODE_ENVIRONMENT: 'development',
  ALLOW_UNAUTHORIZED: 'false',
  PORT: '5000',
  DATABASE_DROP: 'false',
  DATABASE_PORT: '3306',
  DATABASE_NAME: 'publisher_services_dev',
  DATABASE_DBG: 'false',
  DNA_APP_ID: 'this-needs-to-be-generated-somewhare',
  DNA_AUTH_TOKEN: 'this-needs-to-be-generated-somewhare',
  DNA_DISCOVERY_URL: 'this-needs-to-be-found-somewhare',
  CLIENT_VERSION: '0.0.1',
  BINARY_DISTRIBUTION_SERVICE_URL: 'https://bds-dev.d2dragon.net/api/v1.0',

  isDev: () => {
    return envConfig.NODE_ENVIRONMENT === 'development';
  },
  isTest: () => {
    return envConfig.NODE_ENVIRONMENT === 'test';
  },

  ...process.env,
};

if (envConfig.isDev()) {
  envConfig.WEBHOOK_SECRET_KEY = '63c114560dc2bb11ef28cdfbeab09724';
  envConfig.JWT_SECRET_KEY = 'supersecrejwtkey';
}

if (!envConfig.isTest()) {
  if (!envConfig.DATABASE_HOST) {
    throw new Error('Missing DATABASE_HOST environment configuration');
  }

  if (!envConfig.DATABASE_PASS) {
    throw new Error('Missing DATABASE_PASS environment configuration');
  }

  if (!envConfig.DATABASE_USER) {
    throw new Error('Missing DATABASE_USER environment configuration');
  }

  if (!envConfig.WEBHOOK_SECRET_KEY) {
    throw new Error('Missing WEBHOOK_SECRET_KEY environment configuration');
  }
}
