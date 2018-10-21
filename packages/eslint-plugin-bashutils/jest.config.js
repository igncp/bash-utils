const pjson = require('./package.json')

const coverageThreshold =
  pjson.jest && pjson.jest.coverageThreshold ? pjson.jest.coverageThreshold : {}

module.exports = {
  coverageReporters: ['json-summary', 'lcov', 'text-summary'],
  globals: {
    __TEST__: true,
  },
  coverageThreshold,
}
