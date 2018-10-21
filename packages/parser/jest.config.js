const path = require('path')

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
  },
  coverageThreshold: {
    global: {
      statements: 96.42,
      branches: 91.28,
      functions: 92.68,
      lines: 96.55,
    },
  },
}
