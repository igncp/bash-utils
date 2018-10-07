import rule from '../../src/rules/no-multiple-empty-lines'

import { runTest, ruleTestMapper } from './helpers'

const expectedErrorMessage = {
  message: 'Multiple empty lines are not allowed',
}

runTest('no-multiple-empty-lines', rule, {
  valid: [
    {
      code: 'echo foo',
    },
    {
      code: 'echo foo; echo bar',
    },
    {
      code: 'echo foo\necho bar',
    },
    {
      code: 'echo foo\necho\necho',
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'echo foo\n\n\necho bar',
      errors: [expectedErrorMessage],
    },
    {
      code: 'echo foo\n\n\necho\n\necho',
      errors: [expectedErrorMessage, expectedErrorMessage],
    },
  ].map(ruleTestMapper),
})
