import { EOF, Lexer as ChevLexer, Parser as ChevParser } from 'chevrotain'

import {
  ALL_TOKENS,
  AMPERSAND,
  AND,
  BACKTICK_STRING,
  COMMAND_SUBSTITUTION_LEFT,
  COMMENT,
  CURLY_BRACKET_LEFT,
  CURLY_BRACKET_RIGHT,
  DO,
  DONE,
  FI,
  FUNCTION,
  IDENTIFIER,
  IF,
  NEWLINE,
  OR,
  PARENTHESES_LEFT,
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
  WHILE,
} from './tokens'

const Lexer = new ChevLexer(ALL_TOKENS, {
  deferDefinitionErrorsHandling: true,
  ensureOptimizations: true,
  positionTracking: 'onlyStart',
})

const reservedWords = [
  CURLY_BRACKET_LEFT,
  CURLY_BRACKET_RIGHT,
  DONE,
  FUNCTION,
  FI,
]

const getIsReservedWord = tokenValue => {
  for (let i = 0; i < reservedWords.length; i++) {
    const word = reservedWords[i]

    if (word.PATTERN === tokenValue) {
      return true
    }
  }

  return false
}

export class Parser extends ChevParser {
  public Script = this.RULE('Script', () => {
    this.MANY(() => {
      this.CONSUME(NEWLINE)
    })

    this.OPTION1(() => {
      this.SUBRULE(this.MultipleCommand)
    })

    this.MANY1(() => {
      this.CONSUME1(NEWLINE)
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
    this.OR([
      { ALT: () => this.SUBRULE(this.IfExpression) },
      { ALT: () => this.SUBRULE(this.Pipeline) },
      { ALT: () => this.SUBRULE(this.Comment) },
    ])

    this.MANY(() => {
      this.SUBRULE1(this.Termination)

      this.OR1([
        { ALT: () => this.SUBRULE2(this.IfExpression) },
        { ALT: () => this.SUBRULE2(this.Pipeline) },
        { ALT: () => this.SUBRULE2(this.Comment) },
      ])
    })

    this.OPTION(() => {
      this.SUBRULE(this.Termination)
    })
  })

  protected FunctionExpression = this.RULE('FunctionExpression', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(FUNCTION)
          this.CONSUME(IDENTIFIER)
          this.OPTION(() => {
            this.CONSUME(PARENTHESES_LEFT)
            this.CONSUME(PARENTHESES_RIGHT)
          })
        },
      },
      {
        ALT: () => {
          this.CONSUME1(IDENTIFIER)
          this.CONSUME1(PARENTHESES_LEFT)
          this.CONSUME1(PARENTHESES_RIGHT)
        },
      },
    ])
    this.CONSUME(CURLY_BRACKET_LEFT)
    this.MANY(() => {
      this.CONSUME(NEWLINE)
    })
    this.SUBRULE(this.MultipleCommandWithTerminator)
    this.CONSUME(CURLY_BRACKET_RIGHT)
  })

  protected MultipleCommandWithTerminator = this.RULE(
    'MultipleCommandWithTerminator',
    () => {
      this.OR([
        { ALT: () => this.SUBRULE(this.IfExpression) },
        { ALT: () => this.SUBRULE(this.Pipeline) },
        { ALT: () => this.SUBRULE(this.Comment) },
      ])

      this.MANY({
        DEF: () => {
          this.SUBRULE1(this.Termination)

          this.OR1([
            { ALT: () => this.SUBRULE2(this.IfExpression) },
            { ALT: () => this.SUBRULE2(this.Pipeline) },
            { ALT: () => this.SUBRULE2(this.Comment) },
          ])
        },
        GATE: () => !getIsReservedWord(this.LA(2).image),
      })

      this.SUBRULE(this.Termination)
    }
  )

  protected Termination = this.RULE('Termination', () => {
    this.OR([
      { ALT: () => this.CONSUME(SEMICOLON) },
      {
        ALT: () => {
          this.AT_LEAST_ONE(() => {
            this.CONSUME(NEWLINE)
          })
        },
      },
    ])
  })

  protected CommandUnit = this.RULE('CommandUnit', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.ProcessSubstitution) },
      { ALT: () => this.SUBRULE(this.CommandSubstitutionGroup) },
      { ALT: () => this.SUBRULE(this.Literal) },
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

  protected CommandSubstitutionGroup = this.RULE(
    'CommandSubstitutionGroup',
    () => {
      let occurrence = 0

      const getDoesNotHaveSeparationFn = minOccurrence => () => {
        if (occurrence < minOccurrence) {
          return true
        }

        const prevToken = this.LA(0)
        const currentToken = this.LA(1)

        if (isNaN(currentToken.startOffset) || isNaN(prevToken.startOffset)) {
          return true
        }

        const diff =
          currentToken.startOffset -
          (prevToken.startOffset + prevToken.image.length)

        return diff === 0
      }

      this.AT_LEAST_ONE({
        DEF: () => {
          this.MANY(() => {
            this.SUBRULE(this.Literal)
          })

          this.SUBRULE(this.CommandSubstitution)

          this.MANY1({
            DEF: () => {
              this.SUBRULE1(this.Literal)
            },
            GATE: getDoesNotHaveSeparationFn(0),
          })

          occurrence += 1
        },
        GATE: getDoesNotHaveSeparationFn(1),
      })
    }
  )

  protected Command = this.RULE('Command', () => {
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.CommandUnit)
    })

    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.Redirection) },
        { ALT: () => this.SUBRULE1(this.CommandUnit) },
      ])
    })

    this.OPTION(() => {
      this.CONSUME(AMPERSAND)
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

  protected PipelineBlock = this.RULE('PipelineBlock', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.SubShell) },
      { ALT: () => this.SUBRULE(this.WhileExpression) },
      { ALT: () => this.SUBRULE(this.FunctionExpression) },
      { ALT: () => this.SUBRULE(this.CommandsGroup) },
      { ALT: () => this.SUBRULE(this.ComposedCommand) },
    ])
  })

  protected CommandsGroup = this.RULE('CommandsGroup', () => {
    this.CONSUME(CURLY_BRACKET_LEFT)
    this.AT_LEAST_ONE({
      DEF: () => {
        this.SUBRULE(this.MultipleCommandWithTerminator)
      },
      GATE: () => !getIsReservedWord(this.LA(1).image),
    })
    this.CONSUME(CURLY_BRACKET_RIGHT)
  })

  protected SubShell = this.RULE('SubShell', () => {
    this.CONSUME(PARENTHESES_LEFT)
    this.AT_LEAST_ONE(() => {
      this.SUBRULE(this.MultipleCommand)
    })
    this.CONSUME(PARENTHESES_RIGHT)
  })

  protected Pipeline = this.RULE('Pipeline', () => {
    this.SUBRULE(this.PipelineBlock)

    this.MANY(() => {
      this.CONSUME1(PIPE)
      this.OPTION(() => {
        this.CONSUME(NEWLINE)
      })
      this.SUBRULE1(this.PipelineBlock)
    })

    this.OPTION1(() => {
      this.SUBRULE1(this.Comment)
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
    this.SUBRULE(this.Literal)
  })

  protected RedirectionB = this.RULE('RedirectionB', () => {
    this.CONSUME(REDIRECTION_FORWARD_DOUBLE)
    this.SUBRULE(this.Literal)
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

      this.AT_LEAST_ONE({
        DEF: () => {
          this.SUBRULE(this.CommandUnit)
        },
        GATE: () => this.LA(1).image !== SQ_BRACKET_RIGHT.PATTERN,
      })

      this.CONSUME(SQ_BRACKET_RIGHT)
    }
  )

  protected IfConditionDoubleBrackets = this.RULE(
    'IfConditionDoubleBrackets',
    () => {
      this.CONSUME(SQ_BRACKET_2_LEFT)

      this.AT_LEAST_ONE({
        DEF: () => {
          this.SUBRULE(this.CommandUnit)
        },
        GATE: () => this.LA(1).image !== SQ_BRACKET_2_RIGHT.PATTERN,
      })

      this.CONSUME(SQ_BRACKET_2_RIGHT)
    }
  )

  protected Comment = this.RULE('Comment', () => {
    this.CONSUME(COMMENT)
  })

  protected WhileExpression = this.RULE('WhileExpression', () => {
    this.CONSUME(WHILE)
    this.SUBRULE(this.Command)
    this.SUBRULE(this.Termination)
    this.CONSUME(DO)
    this.OPTION(() => {
      this.CONSUME(NEWLINE)
    })
    this.SUBRULE(this.MultipleCommandWithTerminator)
    this.CONSUME(DONE)
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

    this.performSelfAnalysis()
  }
}

const getTokens = list => {
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

const errors = list =>
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
    tokens: getTokens(lexingResult.tokens),
    value,
  }
}
