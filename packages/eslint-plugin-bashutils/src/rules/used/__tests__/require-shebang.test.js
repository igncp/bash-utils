import rule from '../require-shebang'

import { runTest, ruleTestMapper } from '../../../../helpers/testsHelpers'

const expectedErrorMessageMissing = {
  messageId: 'missing',
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
