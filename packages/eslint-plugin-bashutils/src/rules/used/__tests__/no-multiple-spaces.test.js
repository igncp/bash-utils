import rule from '../no-multiple-spaces'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

const expectedErrorMessageMultiple = {
  messageId: 'multiple',
}

runTest('no-multiple-spaces', rule, {
  valid: ['echo foo', 'echo "$FOO   bar"'].map(ruleTestMapper),
  invalid: [
    {
      code: 'echo  foo',
      errors: [expectedErrorMessageMultiple],
    },
    {
      code: '"$(foo    bar)"',
      errors: [expectedErrorMessageMultiple],
    },
  ].map(ruleTestMapper),
})
