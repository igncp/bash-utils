import path from 'path'
import { RuleTester } from 'eslint'

import { configs } from '../src'

RuleTester.it = (msg, fn) => {
  const lines = msg.split('\n')
  const parsedMsg = lines[0] + (lines.length > 1 ? ' [...]' : '')

  it(parsedMsg, fn)
}

const ruleTester = new RuleTester({
  ...{
    ...configs.recommended,
    rules: {},
  },
})

const parser = path.resolve(path.join(__dirname, '../src'))

const runTest = (ruleName, rule, tests) => {
  describe(ruleName, () => {
    test('meta', () => {
      expect(rule.meta).toBeTruthy()
      expect(rule.meta.docs).toBeTruthy()
      expect(rule.meta.docs.description).toBeTruthy()
      expect(rule.create).toBeTruthy()
    })

    tests.valid = tests.valid.filter(t => t.skip !== true)
    tests.invalid = tests.invalid.filter(t => t.skip !== true)

    if (tests.valid.length !== tests.invalid.length) {
      if (tests.valid.length === 0 || tests.invalid.length === 0) {
        throw new Error(
          'You need to pase either both valid and invalid tests or none'
        )
      }
    } else if (tests.valid.length === 0) {
      return
    }

    ruleTester.run('spec', rule, tests)
  })
}

runTest.skip = ruleName => {
  describe.skip(ruleName)
}

const ruleTestMapper = opts => ({
  ...(typeof opts === 'string' ? { code: opts } : opts),
  parser,
})

export { runTest, ruleTestMapper }
