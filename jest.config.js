// Place test-specific environment properies and values here
const TestEnv = {
  NODE_ENVIRONMENT: 'test',
  DATABASE_DBG: 'false',
  DATABASE_NAME: 'publisher_test',
  ALLOW_UNAUTHORIZED: 'false',
  WEBHOOK_SECRET_KEY: 'webhooks_secret',
  JWT_SECRET_KEY: 'supersecrejwtkey',
  TEMP_FLAG_VERSION_1_0_AUTH_OFF: 'false'
};

Object.keys(TestEnv).forEach(key => {
  process.env[key] = TestEnv[key];
});

module.exports = {
  modulePathIgnorePatterns: ['dist', 'docs'],
  preset: 'ts-jest',
  coveragePathIgnorePatterns : [
    "<rootDir>/src/services/devtokengenerator.ts" ,
    "<rootDir>/src/controllers/devtokengenerator.ts"
  ],
};
