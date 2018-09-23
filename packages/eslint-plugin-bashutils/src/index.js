const { name, version } = require('../package.json')

const warnings = []
const errors = []

const allRules = [...warnings, ...errors].sort()

const ast = () => {}

const visitorKeys = () => {}

const rules = allRules.reduce((acc, rule) => {
  acc[rule] = require(`./rules/${rule}`)

  return acc
}, {})

const addRule = (level = 'warn', mapped) => {
  return rule => {
    mapped[`bashutils/${rule}`] = level
  }
}

const ruleConfig = [warnings, errors].reduce((acc, rulesOfType) => {
  rulesOfType.forEach(addRule('warn', acc))

  return acc
}, {})

const parseForESLint = code => {
  return {
    ast: ast(code),
    code,
    scopeManager: null,
    services: {},
    visitorKeys,
  }
}

const configs = {
  recommended: {
    parser: name,
    plugins: ['bashutils'],
    rules: ruleConfig,
  },
}

export { configs, rules, parseForESLint, version }
