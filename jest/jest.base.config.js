module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '@libs/common/(.*)': '<rootDir>/libs/common/src/$1',
    '@libs/common': '<rootDir>/libs/common/src',
  },
  testPathIgnorePatterns: [
    '<rootDir>/volumes/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ]
}