const rule = require('../../../src/rules/experimental/oneLine')
const { RuleTester } = require('eslint')

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
}

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions })

ruleTester.run('one-line', rule, {
  valid: [
    {
      code: 'echo foo',
    },
  ],
  invalid: [
    {
      code: 'echo bar',
      errors: [
        {
          message: 'Foo',
        },
      ],
    },
  ],
})
