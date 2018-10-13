// @flow

import {
  buildESTreeAstFromSource,
  visitorKeysForESTree,
} from '@bash-utils/parser'

import { version, name } from '../package.json'

import normalRules from './rules/used'
import experimentalRules from './rules/experimental'
import { scopeManager } from './scopeManager'

const finalRules = process.env.BASH_UTILS_USE_EXPERIMENTAL_RULES
  ? { ...normalRules, ...experimentalRules }
  : normalRules

const allRulesEnabled = Object.keys(finalRules).reduce((acc, ruleKey) => {
  return {
    ...acc,
    [`bashutils/${ruleKey}`]: 2,
  }
}, {})

const FAKE_AST = {
  tokens: [],
  comments: [],
  loc: [],
  range: [],
}

const parseForESLint = (code: string) => {
  const value = buildESTreeAstFromSource(code)

  return {
    ast: {
      ...FAKE_AST,
      ...value,
    },
    code,
    scopeManager,
    services: {},
    visitorKeys: visitorKeysForESTree,
  }
}

const configs = {
  recommended: {
    env: {
      builtin: false,
      node: false,
    },
    globals: {},
    parser: name,
    plugins: ['bashutils'],
    rules: allRulesEnabled,
  },
}

export { configs, finalRules as rules, parseForESLint, version }
