// @flow

/**
 * Enforces a certain style for functions
 *
 * Acceps an object as options with the following properties:
 *
 * - withFunctionKeyword: Boolean [=true], in case positive it requires the `function` keyword
 *
 * ### Valid
 *
 * Option: `[2, { withFunctionKeyword: true }]`
 *
 * ```sh
 * function foo () { echo 'foo'; }
 * function foo { echo 'foo'; }
 * ```
 *
 * ### Invalid
 *
 * Option: `[2, { withFunctionKeyword: true }]`
 *
 * ```sh
 * foo () { echo 'foo'; }
 * ```
 *
 * @module Function Style
 */

import { tokens } from '@bash-utils/parser'
import type { T_Rule, T_ESTreeNode } from '@bash-utils/parser'

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'Enforces a certain style for functions',
    },
    schema: [
      {
        type: 'object',
        properties: {
          withFunctionKeyword: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingKeyword: 'Missing keyword for function',
      forbiddenKeyword: 'Forbidden keyword for function',
    },
  },
  create(ctx) {
    const { withFunctionKeyword = true } = ctx.options[0] || {}

    return {
      FunctionExpression(node: T_ESTreeNode) {
        const hasFunctionKeyword =
          node.body[0].type === tokens.FUNCTION.tokenName

        if (withFunctionKeyword !== hasFunctionKeyword) {
          ctx.report({
            messageId: withFunctionKeyword
              ? 'missingKeyword'
              : 'forbiddenKeyword',
            node,
          })
        }
      },
    }
  },
}

export default rule
