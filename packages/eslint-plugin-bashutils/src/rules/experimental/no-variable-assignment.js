// @flow

import { type T_Rule } from '../../types'

const rule: T_Rule = {
  meta: {
    docs: {
      description: 'This rule disallows variable assignment',
    },
  },
  create(ctx) {
    return {
      Assignment(node) {
        ctx.report({
          message: 'Variable assignments are not allowed',
          node,
        })
      },
    }
  },
}

export default rule
