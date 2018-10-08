import { createToken, Lexer } from 'chevrotain'

export const IDENTIFIER = createToken({
  name: 'IDENTIFIER',
  pattern: /([A-Za-z_]+[A-Za-z0-9_]*)/,
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

export const EQUAL = createToken({ name: 'EQUAL', pattern: '=' })

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

  //
  EQUAL,
  TERMINATOR,
  SEMICOLON,
  REDIRECTION_FORWARD_DOUBLE,
  REDIRECTION_FORWARD_SINGLE,
  IF,
  FI,
  THEN,
  ELSE,
  ELIF,

  // last
  IDENTIFIER,
]
