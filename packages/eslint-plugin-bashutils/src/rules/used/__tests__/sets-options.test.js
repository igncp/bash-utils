import rule from '../sets-options'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

runTest('sets-options', rule, {
  valid: [
    {
      code: `set -e
      echo foo`,
      options: [{ included: ['-e'] }],
    },
    {
      code: `set -e
      echo foo`,
      options: [],
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'echo  foo',
      options: [{ included: ['-e'] }],
      errors: [
        {
          messageId: 'missing',
          data: {
            option: '-e',
          },
        },
      ],
    },
    {
      code: 'echo  foo',
      options: [{ included: ['-L'] }],
      errors: [
        {
          messageId: 'supported',
        },
      ],
    },
    {
      code: `set -e
      echo foo`,
      options: [{ excluded: ['-e'] }],
      errors: [
        {
          messageId: 'present',
          data: {
            option: '-e',
          },
        },
      ],
    },
    {
      code: `set -e
      echo foo`,
      options: [{ excluded: ['-e'], included: ['-e'] }],
      errors: [
        {
          messageId: 'repeated',
        },
        {
          messageId: 'present',
        },
      ],
    },
    {
      code: `"FOO"`,
      options: [{ included: ['-e'] }],
      errors: [
        {
          messageId: 'missing',
        },
      ],
    },
  ].map(ruleTestMapper),
})
