/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@personal-finance/types$': '<rootDir>/../../packages/types/index.ts',
    '^@personal-finance/validation$': '<rootDir>/../../packages/validation/index.ts',
    '^@personal-finance/config$': '<rootDir>/../../packages/config/index.ts',
    '^@personal-finance/api-client$': '<rootDir>/../../packages/api-client/index.ts',
  },
};
