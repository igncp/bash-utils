import { createToken, Lexer } from 'chevrotain'

export const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /[A-Za-z_\-0-9=\/.$@~%#\\]+/,
})
export const TERMINATOR = createToken({ name: 'TERMINATOR', pattern: Lexer.NA })

export const SEMICOLON = createToken({
  categories: TERMINATOR,
  line_breaks: true,
  name: 'SEMICOLON',
  pattern: ';',
})
export const REDIRECTION_FORWARD_SINGLE = createToken({
  name: 'REDIRECTION_FORWARD_SINGLE',
  pattern: '>',
})
export const REDIRECTION_FORWARD_DOUBLE = createToken({
  name: 'REDIRECTION_FORWARD_DOUBLE',
  pattern: '>>',
})

export const IF = createToken({
  longer_alt: IDENTIFIER,
  name: 'IF',
  pattern: 'if',
})
export const FI = createToken({
  longer_alt: IDENTIFIER,
  name: 'FI',
  pattern: 'fi',
})
export const THEN = createToken({
  longer_alt: IDENTIFIER,
  name: 'THEN',
  pattern: 'then',
})
export const ELSE = createToken({
  longer_alt: IDENTIFIER,
  name: 'ELSE',
  pattern: 'else',
})
export const ELIF = createToken({
  longer_alt: IDENTIFIER,
  name: 'ELIF',
  pattern: 'elif',
})
export const SQ_BRAQUET_LEFT = createToken({
  name: 'SQ_BRAQUET_LEFT',
  pattern: '[',
})
export const SQ_BRAQUET_RIGHT = createToken({
  name: 'SQ_BRAQUET_RIGHT',
  pattern: ']',
})
export const COMMENT = createToken({
  name: 'COMMENT',
  pattern: /#[^\n\r]*/,
})
export const STRING = createToken({
  name: 'STRING',
  pattern: /(["'])((\\{2})*|(.*?[^\\](\\{2})*))\1/,
})

const WHITESPACE = createToken({
  group: Lexer.SKIPPED,
  name: 'WHITESPACE',
  pattern: /[\s\t]+/,
})

export const NEWLINE = createToken({
  categories: TERMINATOR,
  line_breaks: true,
  name: 'NEWLINE',
  pattern: /\s*[\n\r]+/,
})

export const ALL_TOKENS = [
  // first
  NEWLINE,
  WHITESPACE,
  STRING,
  COMMENT,

  //
  TERMINATOR,
  SEMICOLON,
  REDIRECTION_FORWARD_DOUBLE,
  REDIRECTION_FORWARD_SINGLE,
  IF,
  FI,
  THEN,
  ELSE,
  ELIF,
  SQ_BRAQUET_LEFT,
  SQ_BRAQUET_RIGHT,

  // last
  IDENTIFIER,
]
