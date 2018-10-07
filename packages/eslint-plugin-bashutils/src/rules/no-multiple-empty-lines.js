// @flow

import { tokens as availableTokens } from '@bash-utils/parser'

import type {
  T_Context,
  T_Node,
} from '../types'

// @TODO:
// - Option to configure the number of lines
// - Discard empty lines inside strings (configurable)

export default {
  meta: {
    docs: {
      description: 'Disallow consecutive empty lines',
    },
  },
  create(ctx: T_Context) {
    const sourceCode = ctx.getSourceCode()

    return {
      Program(node: T_Node) {
        const tokens = sourceCode.getTokens(node)
        const newLineTokens = tokens.filter(t => t.type === availableTokens.NEWLINE.tokenName)

        newLineTokens.forEach((t) => {
          if (t.value.split('\n').length > 2) {
            ctx.report({
              message: 'Multiple empty lines are not allowed',
              node: t,
            })
          }
        })
      },
    }
  },
}
