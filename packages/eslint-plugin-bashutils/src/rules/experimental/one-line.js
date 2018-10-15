// @flow

import { tokens as availableTokens } from '@bash-utils/parser'

import { type T_Rule } from '../../types'

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'This rule only allows single-line scripts',
    },
  },
  create(ctx) {
    const sourceCode = ctx.getSourceCode()

    return {
      Program(node) {
        const tokens = sourceCode.getTokens(node)
        const newLineTokens = tokens.filter(
          t => t.type === availableTokens.NEWLINE.tokenName
        )

        newLineTokens.forEach(t => {
          ctx.report({
            message: 'New line is not allowed',
            node: t,
          })
        })
      },
    }
  },
}

export default rule
