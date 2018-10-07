import path from 'path'
import { RuleTester } from 'eslint'

import { configs } from '../../src'

const ruleTester = new RuleTester({
  ...{
    ...configs.recommended,
    rules: {},
  },
})

const parser = path.resolve(path.join(__dirname, '../../src'))

export const runTest = (ruleName, rule, tests) => {
  describe(ruleName, () => {
    test('meta', () => {
      expect(rule.meta).toBeTruthy()
      expect(rule.meta.docs).toBeTruthy()
      expect(rule.meta.docs.description).toBeTruthy()
      expect(rule.create).toBeTruthy()
    })

    ruleTester.run('spec', rule, tests)
  })
}

export const ruleTestMapper = (opts) => ({
  ...opts,
  parser,
})
