import rule from '../../../src/rules/experimental/no-variable-assignment'

import { runTest, ruleTestMapper } from '../helpers'

const expectedErrorMessage = {
  message: 'Variable assignments are not allowed',
}

runTest('no-variable-assignment', rule, {
  valid: [
    {
      code: 'echo foo',
    },
    {
      code: 'echo foo; echo bar',
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'foo=bar baz',
      errors: [expectedErrorMessage],
    },
    {
      code: 'foo=bar baz BAR=baz',
      errors: [expectedErrorMessage, expectedErrorMessage],
    },
    {
      code: 'foo=bar BAR=baz baz',
      errors: [expectedErrorMessage, expectedErrorMessage],
    },
  ].map(ruleTestMapper),
})
