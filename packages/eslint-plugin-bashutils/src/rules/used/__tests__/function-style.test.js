import rule from '../function-style'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

runTest('function-style', rule, {
  valid: [
    {
      code: `function foo() { echo foo; }`,
      options: [],
    },
    {
      code: `function foo { echo foo; }`,
      options: [{}],
    },
    {
      code: `function foo() { echo foo; }`,
      options: [{ withFunctionKeyword: true }],
    },
    {
      code: `function foo { echo foo; }`,
      options: [{ withFunctionKeyword: true }],
    },
    {
      code: `foo() { echo foo; }`,
      options: [{ withFunctionKeyword: false }],
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'foo () { echo foo; }',
      options: [{ withFunctionKeyword: true }],
      errors: [
        {
          messageId: 'missingKeyword',
        },
      ],
    },
    {
      code: 'function foo () { echo foo; }',
      options: [{ withFunctionKeyword: false }],
      errors: [
        {
          messageId: 'forbiddenKeyword',
        },
      ],
    },
    {
      code: 'function foo { echo foo; }',
      options: [{ withFunctionKeyword: false }],
      errors: [
        {
          messageId: 'forbiddenKeyword',
        },
      ],
    },
  ].map(ruleTestMapper),
})
