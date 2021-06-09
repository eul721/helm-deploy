import { version } from '../../package.json';

const {
  ALLOW_UNAUTHORIZED = 'false',
  BINARY_DISTRIBUTION_SERVICE_URL = 'https://bds-dev.d2dragon.net/api/v1.0',
  DATABASE_DBG = 'false',
  DATABASE_DROP = 'false',
  DATABASE_HOST = '',
  DATABASE_NAME = 'publisher_services_dev',
  DATABASE_PASS = '',
  DATABASE_PORT = '3306',
  DATABASE_USER = '',
  DEPLOYED_VERSION = 'n/a',
  DNA_APP_ID = 'this-needs-to-be-generated-somewhare',
  DNA_APP_SECRET = 'this-needs-to-be-generated-somewhare',
  DNA_DISCOVERY_URL = 'this-needs-to-be-found-somewhare',
  JWT_SECRET_KEY = '',
  NODE_ENVIRONMENT = 'development',
  PORT = '5000',
  WEBHOOK_SECRET_KEY = '',
  TEMP_FLAG_VERSION_1_0_AUTH_OFF = 'true',
} = process.env;

/*
  Wrapper interface for all the env variables from .env or in case of tests from TestEnv in jest.config.js
  Note that all vars on it need to be string based otherwise reading from the file will malfunction
*/
interface EnvVars {
  ALLOW_UNAUTHORIZED: boolean;
  BINARY_DISTRIBUTION_SERVICE_URL: string;
  CLIENT_VERSION: string;
  DATABASE_DBG: boolean;
  DATABASE_DROP: boolean;
  DATABASE_HOST?: string;
  DATABASE_NAME: string;
  DATABASE_PASS?: string;
  DATABASE_PORT: string;
  DATABASE_USER?: string;
  /* SHA from CI indicating latest git commit */
  DEPLOYED_VERSION?: string;
  DNA_APP_ID: string;
  DNA_APP_SECRET: string;
  DNA_DISCOVERY_URL: string;
  JWT_SECRET_KEY?: string;
  NODE_ENVIRONMENT: string;
  PORT: string;
  WEBHOOK_SECRET_KEY?: string;
  /* Temporary flag just for the 1.0 version to disable some parts of auth (licensing and BDS-webhook RBAC checks) */
  TEMP_FLAG_VERSION_1_0_AUTH_OFF: boolean;
  isDev(): boolean;
  isTest(): boolean;
}

export const envConfig: EnvVars = {
  ALLOW_UNAUTHORIZED: ALLOW_UNAUTHORIZED === 'true',
  BINARY_DISTRIBUTION_SERVICE_URL,
  CLIENT_VERSION: version,
  DATABASE_DBG: DATABASE_DBG === 'true',
  DATABASE_DROP: DATABASE_DROP === 'true',
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASS,
  DATABASE_PORT,
  DATABASE_USER,
  DEPLOYED_VERSION,
  DNA_APP_ID,
  DNA_APP_SECRET,
  DNA_DISCOVERY_URL,
  JWT_SECRET_KEY,
  NODE_ENVIRONMENT,
  PORT,
  WEBHOOK_SECRET_KEY,
  TEMP_FLAG_VERSION_1_0_AUTH_OFF: TEMP_FLAG_VERSION_1_0_AUTH_OFF === 'true',

  isDev: () => {
    return envConfig.NODE_ENVIRONMENT === 'development' || envConfig.NODE_ENVIRONMENT === 'develop';
  },
  isTest: () => {
    return envConfig.NODE_ENVIRONMENT === 'test';
  },
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
