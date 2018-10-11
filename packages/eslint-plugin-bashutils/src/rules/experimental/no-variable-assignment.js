export default {
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
