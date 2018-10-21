// @flow

/**
 * Forbids adding multiple consecutive spaces (except certain cases)
 *
 * ### Valid
 *
 * ```sh
 * echo foo
 * ```
 *
 * ### Invalid
 *
 * ```sh
 * echo   foo
 * ```
 *
 * @module No Multiple Spaces
 */

import type { T_Rule, T_ESTreeProgramNode } from '../../types'

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'This rule only allows one space for separation',
    },
    messages: {
      multiple: 'Multiple spaces are not allowd',
    },
  },
  create(ctx) {
    return {
      Program(node: T_ESTreeProgramNode) {
        const allItems = node.tokens.concat(node.comments).sort((a, b) => {
          return a.range[0] - b.range[0]
        })

        allItems.forEach((item, idx) => {
          if (idx === 0) {
            return
          }

          const prevItem = allItems[idx - 1]

          if (
            prevItem.loc.end.line === item.loc.start.line &&
            item.range[0] - prevItem.range[1] > 1
          ) {
            ctx.report({
              messageId: 'multiple',
              node: item,
            })
          }
        })
      },
    }
  },
}

export default rule
