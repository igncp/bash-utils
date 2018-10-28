const { createToken, Lexer } = require('chevrotain')

const NewLine = createToken({
  name: 'NewLine',
  pattern: /\r?\n/,
})
const CommandSubstitutionLeft = createToken({
  name: 'CommandSubstitutionLeft',
  pattern: /\$\(/,
})
const CommandSubstitutionRight = createToken({
  name: 'CommandSubstitutionRight',
  pattern: /\)/,
})
const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[A-Za-z$]+/,
})
const WHITESPACE = createToken({
  group: Lexer.SKIPPED,
  name: 'WHITESPACE',
  pattern: /[\s\t]+/,
})

const allTokens = [
  WHITESPACE,
  NewLine,
  CommandSubstitutionLeft,
  CommandSubstitutionRight,
  IDENTIFIER,
]

const CustomLexter = new Lexer(allTokens)

CustomLexter.tokenize('ab$(echo foo)a$(bar)ab')
