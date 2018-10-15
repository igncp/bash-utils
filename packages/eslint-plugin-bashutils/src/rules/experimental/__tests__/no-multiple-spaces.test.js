import rule from '../no-multiple-spaces'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

const { MESSAGE_MULTIPLE } = rule._test

const expectedErrorMessageMultiple = {
  message: MESSAGE_MULTIPLE || 'ERROR',
}

runTest('no-multiple-spaces', rule, {
  valid: [
    {
      code: 'echo foo',
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'echo  foo',
      errors: [expectedErrorMessageMultiple],
    },
  ].map(ruleTestMapper),
})
