const path = require('path')

const pjson = require('./package.json')

const coverageThreshold =
  pjson.jest && pjson.jest.coverageThreshold ? pjson.jest.coverageThreshold : {}

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '/test/.*test\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  bail: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  setupTestFrameworkScriptFile: '<rootDir>/helpers/setupTests.js',
  coverageReporters: ['json-summary', 'lcov', 'text-summary', 'clover'],
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(path.join(__dirname, 'tsconfig.jest.json')),
      babelConfig: false,
      diagnostics: false,
    },
    __TEST__: true,
  },
  coverageThreshold,
}
