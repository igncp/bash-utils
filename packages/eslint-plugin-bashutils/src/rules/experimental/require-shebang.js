import { tokens } from '@bash-utils/parser'

// eslint transforms shebangs to comments in the code passed to the parser
// Can't use here the Shebang node type

const MESSAGE_MISSING = 'Missing Shebang'

const rule = {
  meta: {
    docs: {
      description: 'This rules enforces the presence of a shebang',
    },
  },
  create(ctx) {
    const { text } = ctx.getSourceCode()

    return {
      Program(node) {
        let found = false

        for (let i = 0; i < node.tokens.length; i++) {
          const token = node.tokens[i]

          if (
            token.type === tokens.IDENTIFIER.tokenName &&
            token.value.substr(0, 3) === '///' &&
            token.loc.start.line === 1 &&
            text.substr(0, 2) === '#!'
          ) {
            found = true
          } else if (token.loc.start.line > 1) {
            break
          }
        }

        if (!found) {
          ctx.report({
            message: MESSAGE_MISSING,
            loc: {
              end: { line: 1, column: 1 },
              start: { line: 1, column: 1 },
            },
          })
        }
      },
    }
  },
}

if (global.__TEST__) {
  rule._test = {
    MESSAGE_MISSING,
  }
}

export default rule
