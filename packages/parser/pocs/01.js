// extracted from chevrotain repository examples

const assert = require('assert')
const { createToken, Lexer, Parser, EMPTY_ALT } = require('chevrotain')

const Text = createToken({ name: 'Text', pattern: /[^,\n\r"]+/ })
const Comma = createToken({ name: 'Comma', pattern: /,/ })
const NewLine = createToken({
  name: 'NewLine',
  pattern: /\r?\n/,
})
const StringToken = createToken({
  name: 'StringToken',
  pattern: /"(?:""|[^"])*"/,
})

const allTokens = [Text, StringToken, Comma, NewLine]

class CsvParser extends Parser {
  constructor(input) {
    super(input, allTokens, {
      outputCst: true,
      recoveryEnabled: false,
    })

    this.RULE('csvFile', () => {
      // debugger
      this.SUBRULE(this.hdr)
      this.AT_LEAST_ONE(() => {
        this.SUBRULE2(this.row)
      })
    })

    this.RULE('hdr', () => {
      this.SUBRULE(this.row)
    })

    this.RULE('row', () => {
      this.SUBRULE(this.field)
      this.MANY(() => {
        this.CONSUME(Comma)
        this.SUBRULE2(this.field)
      })
      this.CONSUME(NewLine)
    })

    this.RULE('field', () => {
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Text)
          },
        },
        {
          ALT: () => {
            this.CONSUME(StringToken)
          },
        },
        { ALT: EMPTY_ALT('empty field') },
      ])
    })

    this.performSelfAnalysis()
  }
}

const parser = new CsvParser([])
const CsvLexer = new Lexer(allTokens)

const parse = text => {
  const lexResult = CsvLexer.tokenize(text)

  parser.input = lexResult.tokens

  const cst = parser.csvFile()

  return {
    cst,
    lexResult,
    parseErrors: parser.errors,
  }
}

const checkOk = text => {
  const result = parse(text)

  assert(result.parseErrors.length === 0)
}

const checkNotOk = text => {
  const result = parse(text)

  assert(result.parseErrors.length !== 0)
}

checkOk('"foo","bar"\nbam,baz\n')
checkOk('bam,baz\n\n')

checkNotOk(',,\n')
