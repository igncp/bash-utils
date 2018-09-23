import { EOF, Lexer as ChevLexer, Parser as ChevParser } from 'chevrotain'

import {
  ALL_TOKENS,
  EQUAL,
  IDENTIFIER,
  NEWLINE,
  REDIRECTION_FORWARD_SINGLE,
  SEMICOLON,
} from './tokens'

const Lexer = new ChevLexer(ALL_TOKENS, {
  deferDefinitionErrorsHandling: true,
  ensureOptimizations: true,
  positionTracking: 'onlyStart',
})

class Parser extends ChevParser {
  public Script = this.RULE('Script', () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.Command) },
        { ALT: () => this.CONSUME(SEMICOLON) },
        { ALT: () => this.SUBRULE(this.EmptyStatement) },
      ])
    })

    this.OPTION(() => {
      this.CONSUME(EOF)
    })
  })

  protected Command = this.RULE('Command', () => {
    this.CONSUME1(IDENTIFIER)

    this.OR([
      {
        ALT: () =>
          this.MANY(() => {
            this.CONSUME2(IDENTIFIER)
            this.SUBRULE(this.Redirection)
          }),
      },
      { ALT: () => this.SUBRULE(this.Redirection) },
    ])
  })

  protected EmptyStatement = this.RULE('EmptyStatement', () => {
    this.CONSUME(NEWLINE)
  })

  protected Assignment = this.RULE('Assignment', () => {
    this.CONSUME1(EOF)
    this.CONSUME2(EQUAL)
    this.CONSUME3(EOF)
  })

  protected WordList = this.RULE('WordList', () => {
    this.MANY(() => {
      this.CONSUME(IDENTIFIER)
    })
  })

  // @TODO complete
  protected Redirection = this.RULE('Redirection', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME1(REDIRECTION_FORWARD_SINGLE)
          this.CONSUME2(IDENTIFIER)
        },
      },
    ])
  })

  constructor(input) {
    super(input, ALL_TOKENS, {
      outputCst: true,
      recoveryEnabled: false,
    })

    Parser.performSelfAnalysis(this)
  }
}

const parser = new Parser([])

const tokens = (list = []) => {
  return list.map(t => {
    const { length } = t.image
    const range: [number, number] = [t.startOffset, t.startOffset + length]

    return {
      loc: {
        end: { column: t.startColumn + length, line: t.startLine },
        start: { column: t.startColumn, line: t.startLine },
      },
      range,
      type: t.tokenType.tokenName,
      value: t.image,
    }
  })
}

const errors = (list = []) =>
  list.map(({ name, message, token }) => {
    const location = {
      end: {
        column: token.startColumn + token.image.length,
        line: token.startLine,
      },
      start: { line: token.startLine, column: token.startColumn },
    }

    return { name, message, location }
  })

export const parse = source => {
  if (typeof source !== 'string') {
    throw new Error('You must pass a string as source')
  }

  const lexingResult = Lexer.tokenize(source)

  if (lexingResult.errors.length > 0) {
    // @TODO: Improve this
    throw {
      data: lexingResult.errors,
    }
  }

  parser.input = lexingResult.tokens

  const value = parser.Script()

  return {
    lexErrors: lexingResult.errors,
    parseErrors: errors(parser.errors),
    parser,
    tokens: tokens(lexingResult.tokens),
    value,
  }
}
