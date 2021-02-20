// Place test-specific environment properies and values here
const TestEnv = {
  NODE_ENVIRONMENT: 'test',
};

Object.keys(TestEnv).forEach(key => {
  process.env[key] = TestEnv[key];
});

module.exports = {
  modulePathIgnorePatterns: ['dist', 'docs'],
  preset: 'ts-jest',
};
