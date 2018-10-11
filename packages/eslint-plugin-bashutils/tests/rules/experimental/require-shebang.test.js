import rule from '../../../src/rules/experimental/require-shebang'

import { runTest, ruleTestMapper } from '../helpers'

const { MESSAGE_MISSING } = rule._test

const expectedErrorMessageMissing = {
  message: MESSAGE_MISSING || 'ERROR',
}

runTest('require-shebang', rule, {
  valid: [
    {
      code: '#!/foo/bar',
    },
  ].map(ruleTestMapper),
  invalid: [
    {
      code: 'echo foo',
      errors: [expectedErrorMessageMissing],
    },
    {
      code: `
#!/foo/bar`,
      errors: [expectedErrorMessageMissing],
    },
  ].map(ruleTestMapper),
})
