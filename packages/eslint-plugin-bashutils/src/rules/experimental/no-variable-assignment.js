export default {
  meta: {
    docs: {
      description: 'This rule disallows variable assignment',
    },
  },
  create(ctx) {
    // missing: new AST transformation to generate assignments
    throw new Error('This rule is not available yet')

    // eslint-disable-next-line no-unreachable
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
