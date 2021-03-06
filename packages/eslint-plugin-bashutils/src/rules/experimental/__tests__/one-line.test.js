import rule from '../one-line'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

const expectedErrorMessage = {
  message: 'New line is not allowed',
}

runTest('one-line', rule, {
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
      code: 'echo foo\necho bar',
      errors: [expectedErrorMessage],
    },
    {
      code: 'echo foo\necho\necho',
      errors: [expectedErrorMessage, expectedErrorMessage],
    },
  ].map(ruleTestMapper),
})
