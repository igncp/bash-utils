// this PoC should not return an error. it's objective is to display how to
// use `GATE` with `AT_LEAST_ONE`

const { createToken, Lexer, Parser } = require('chevrotain')

const NewLine = createToken({
  name: 'NewLine',
  pattern: /\r?\n/,
})
const INTEGER = createToken({
  name: 'INTEGER',
  pattern: /[1-9][0-9]*/,
})
const WORD = createToken({
  name: 'WORD',
  pattern: /[a-z]+/,
})
const WHITESPACE = createToken({
  group: Lexer.SKIPPED,
  name: 'WHITESPACE',
  pattern: /[\s\t]+/,
})

const allTokens = [WHITESPACE, NewLine, INTEGER, WORD]

class CustomParser extends Parser {
  constructor(input) {
    super(input, allTokens, {
      outputCst: true,
      recoveryEnabled: false,
    })

    this.wordWithNumber = this.RULE('wordWithNumber', () => {
      let occurrence = 0

      this.AT_LEAST_ONE({
        GATE: () => {
          if (occurrence === 0) {
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
        },
        DEF: () => {
          this.MANY(() => {
            this.CONSUME(WORD)
          })
          this.CONSUME(INTEGER)
          occurrence += 1
        },
      })
    })

    this.RULE('main', () => {
      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.wordWithNumber)
      })
    })

    this.performSelfAnalysis()
  }
}

const parser = new CustomParser([])
const CustomLexer = new Lexer(allTokens)

const checkParsesOk = code => {
  const lexResult = CustomLexer.tokenize(code)

  parser.input = lexResult.tokens

  parser.main()

  if (parser.errors.length > 0) {
    console.info('ERROR')
    console.info(parser.errors)

    process.exit(1)
  }
}

checkParsesOk('12')
checkParsesOk('ab12')
checkParsesOk('12 12')
checkParsesOk('ab12 12')
checkParsesOk('12 ab12')

console.info('all successfull')
