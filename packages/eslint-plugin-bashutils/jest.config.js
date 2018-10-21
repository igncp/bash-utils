module.exports = {
  verbose: true,
  coverageReporters: ['json-summary', 'lcov', 'text-summary'],
  globals: {
    __TEST__: true,
  },
  coverageThreshold: {
    global: {
      statements: 90.36,
      branches: 73.33,
      functions: 85.71,
      lines: 90.24,
    },
  },
}
