// @flow

/**
 * Disallows adding more than one empty line
 *
 * ### Valid
 *
 * ```sh
 * echo foo
 *
 * echo bar
 * ```
 *
 * ### Invalid
 *
 * ```sh
 * echo foo
 *
 *
 * echo bar
 * ```
 *
 * @module No multiple empty lines
 */

import { tokens as availableTokens } from '@bash-utils/parser'
import type { T_Rule } from '@bash-utils/parser'

// @TODO:
// - Option to configure the number of lines
// - Discard empty lines inside strings (configurable)

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'Disallow consecutive empty lines',
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
          if (t.value.split('\n').length > 3) {
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

export default rule
