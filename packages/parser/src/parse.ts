import { EOF, Lexer as ChevLexer, Parser as ChevParser } from 'chevrotain'

import {
  ALL_TOKENS,
  AMPERSAND,
  AND,
  BACKTICK_STRING,
  COMMAND_SUBSTITUTION_LEFT,
  COMMENT,
  CURLY_BRACKET_RIGHT,
  FI,
  IDENTIFIER,
  IF,
  NEWLINE,
  OR,
  PARAMETER_EXPANSION_LEFT,
  PARENTHESES_RIGHT,
  PIPE,
  PROCESS_SUBSTITUTION_GT_LEFT,
  PROCESS_SUBSTITUTION_LT_LEFT,
  REDIRECTION_FORWARD_DOUBLE,
  REDIRECTION_FORWARD_SINGLE,
  SEMICOLON,
  SQ_BRACKET_2_LEFT,
  SQ_BRACKET_2_RIGHT,
  SQ_BRACKET_LEFT,
  SQ_BRACKET_RIGHT,
  STRING,
  THEN,
} from './tokens'

const Lexer = new ChevLexer(ALL_TOKENS, {
  deferDefinitionErrorsHandling: true,
  ensureOptimizations: true,
  positionTracking: 'onlyStart',
})

export class Parser extends ChevParser {
  public Script = this.RULE('Script', () => {
    this.OPTION1(() => {
      this.SUBRULE(this.MultipleCommand)
    })

    this.OPTION2(() => {
      this.CONSUME(EOF)
    })
  })

  protected Literal = this.RULE('Literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(IDENTIFIER) },
      { ALT: () => this.CONSUME(STRING) },
    ])
  })

  protected MultipleCommand = this.RULE('MultipleCommand', () => {
    this.AT_LEAST_ONE(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.Termination) },
        { ALT: () => this.SUBRULE(this.IfExpression) },
        { ALT: () => this.SUBRULE(this.Pipeline) },
        { ALT: () => this.SUBRULE(this.Comment) },
      ])
    })
  })

  protected MultipleCommandWithTerminator = this.RULE(
    'MultipleCommandWithTerminator',
    () => {
      this.AT_LEAST_ONE(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.Pipeline) },
          { ALT: () => this.SUBRULE(this.IfExpression) },
        ])

        this.SUBRULE(this.Termination)
      })
    }
  )

  protected Termination = this.RULE('Termination', () => {
    this.OR([
      { ALT: () => this.CONSUME(SEMICOLON) },
      { ALT: () => this.CONSUME(NEWLINE) },
    ])
  })

  protected CommandUnit = this.RULE('CommandUnit', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.Literal) },
      { ALT: () => this.SUBRULE(this.ProcessSubstitution) },
      { ALT: () => this.SUBRULE(this.CommandSubstitution) },
      { ALT: () => this.SUBRULE(this.ParameterExpansion) },
    ])
  })

  protected ProcessSubstitution = this.RULE('ProcessSubstitution', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(PROCESS_SUBSTITUTION_LT_LEFT)
        },
      },
      {
        ALT: () => {
          this.CONSUME(PROCESS_SUBSTITUTION_GT_LEFT)
        },
      },
    ])

    this.SUBRULE(this.MultipleCommand)
    this.CONSUME(PARENTHESES_RIGHT)
  })

  protected ParameterExpansion = this.RULE('ParameterExpansion', () => {
    this.CONSUME(PARAMETER_EXPANSION_LEFT)
    this.SUBRULE(this.MultipleCommand)
    this.CONSUME(CURLY_BRACKET_RIGHT)
  })

  protected BacktickExpression = this.RULE('BacktickExpression', () => {
    this.CONSUME(BACKTICK_STRING)
  })

  protected CommandSubstitution = this.RULE('CommandSubstitution', () => {
    this.OR([
      {
        ALT: () => {
          this.SUBRULE(this.BacktickExpression)
        },
      },
      {
        ALT: () => {
          this.CONSUME(COMMAND_SUBSTITUTION_LEFT)
          this.OPTION1(() => {
            this.SUBRULE1(this.MultipleCommand)
          })
          this.CONSUME(PARENTHESES_RIGHT)
        },
      },
    ])
  })

  protected Command = this.RULE('Command', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.CommandUnit)
    })

    this.OPTION(() => {
      this.CONSUME(AMPERSAND)
    })

    this.OPTION1(() => {
      this.SUBRULE1(this.Redirection)
    })
  })

  protected ComposedCommand = this.RULE('ComposedCommand', () => {
    this.SUBRULE(this.Command)

    this.MANY(() => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(AND)
            this.SUBRULE1(this.Command)
          },
        },
        {
          ALT: () => {
            this.CONSUME(OR)
            this.SUBRULE2(this.Command)
          },
        },
      ])
    })
  })

  protected Pipeline = this.RULE('Pipeline', () => {
    this.SUBRULE(this.ComposedCommand)

    this.MANY(() => {
      this.CONSUME(PIPE)
      this.SUBRULE1(this.ComposedCommand)
    })
  })

  protected WordList = this.RULE('WordList', () => {
    this.AT_LEAST_ONE(() => {
      this.CONSUME(IDENTIFIER)
    })
  })

  protected Redirection = this.RULE('Redirection', () => {
    this.OR([
      {
        ALT: () => this.SUBRULE(this.RedirectionA),
      },
      {
        ALT: () => this.SUBRULE(this.RedirectionB),
      },
    ])
  })

  protected RedirectionA = this.RULE('RedirectionA', () => {
    this.CONSUME(REDIRECTION_FORWARD_SINGLE)
    this.CONSUME(IDENTIFIER)
  })

  protected RedirectionB = this.RULE('RedirectionB', () => {
    this.CONSUME(REDIRECTION_FORWARD_DOUBLE)
    this.CONSUME(IDENTIFIER)
  })

  protected IfConditionGroup = this.RULE('IfConditionGroup', () => {
    this.SUBRULE(this.IfCondition)

    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(OR) },
        { ALT: () => this.CONSUME(AND) },
      ])

      this.SUBRULE1(this.IfCondition)
    })

    this.SUBRULE2(this.Termination)
  })

  protected IfCondition = this.RULE('IfCondition', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.IfConditionSingleBrackets) },
      { ALT: () => this.SUBRULE1(this.IfConditionDoubleBrackets) },
    ])
  })

  protected IfConditionSingleBrackets = this.RULE(
    'IfConditionSingleBrackets',
    () => {
      this.CONSUME(SQ_BRACKET_LEFT)

      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.CommandUnit)
      })

      this.CONSUME(SQ_BRACKET_RIGHT)
    }
  )

  protected IfConditionDoubleBrackets = this.RULE(
    'IfConditionDoubleBrackets',
    () => {
      this.CONSUME(SQ_BRACKET_2_LEFT)

      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.CommandUnit)
      })

      this.CONSUME(SQ_BRACKET_2_RIGHT)
    }
  )

  protected Comment = this.RULE('Comment', () => {
    this.CONSUME(COMMENT)
  })

  protected IfExpression = this.RULE('IfExpression', () => {
    this.CONSUME(IF)
    this.SUBRULE(this.IfConditionGroup)
    this.CONSUME(THEN)
    this.OPTION(() => {
      this.CONSUME(NEWLINE)
    })
    this.SUBRULE(this.MultipleCommandWithTerminator)
    this.CONSUME(FI)
  })

  constructor(input) {
    super(input, ALL_TOKENS, {
      // maxLookahead: 0, // tune this to detect and debug bottle-necks
      outputCst: true,
      recoveryEnabled: false,
    })

    Parser.performSelfAnalysis(this)
  }
}

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

// defining the parser once improves performance and is recommended
const parser = new Parser([])

export const parse = (source, { entry = 'Script' } = {}) => {
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

  const value = parser[entry]()
  const parseErrors = errors(parser.errors)

  if (parseErrors.length) {
    const { message, location } = parseErrors[0]
    const { column, line } = location.start

    const err = new SyntaxError(`${message} at ${line}:${column}`)

    throw err
  }

  return {
    lexErrors: lexingResult.errors,
    parseErrors,
    parser,
    tokens: tokens(lexingResult.tokens),
    value,
  }
}
