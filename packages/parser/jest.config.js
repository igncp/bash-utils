const path = require('path')

module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/test/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  bail: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  setupTestFrameworkScriptFile: '<rootDir>/helpers/setupTests.js',
  globals: {
    'ts-jest': {
      tsConfig: path.resolve(path.join(__dirname, 'tsconfig.jest.json')),
      babelConfig: false,
      diagnostics: false,
    },
  },
}
