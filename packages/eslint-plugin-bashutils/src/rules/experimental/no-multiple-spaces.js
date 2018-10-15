// @flow

import { type T_Rule } from '../../types'

const MESSAGE_MULTIPLE = 'Multiple spaces are not allowd'

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'This rule only allows one space for separation',
    },
  },
  create(ctx) {
    return {
      Program(node) {
        const allItems = node.tokens.concat(node.comments).sort((a, b) => {
          if (typeof a.range[0] === 'undefined') {
            return 1
          }

          if (typeof b.range[0] === 'undefined') {
            return -1
          }

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
              message: MESSAGE_MULTIPLE,
              node: item,
            })
          }
        })
      },
    }
  },
}

if (global.__TEST__) {
  rule._test = {
    MESSAGE_MULTIPLE,
  }
}

export default rule
