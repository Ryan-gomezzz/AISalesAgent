module.exports = {
  ...require('./jest.config.js'),
  testMatch: ['**/integration/**/*.test.ts'],
  testTimeout: 30000,
}

